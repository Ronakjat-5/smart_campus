const Record = require('../models/Record');

exports.list = async (req, res) => {
  try {
    const module = req.params.module;
    const q = { module };
    if (req.query.studentId) q.studentId = req.query.studentId;
    if (req.query.status) q.status = req.query.status;
    const limit = Math.min(Number(req.query.limit || 500), 1000);
    const records = await Record.find(q).sort({ date: -1, createdAt: -1 }).limit(limit);
    res.json(records);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const record = await Record.create({ ...req.body, module: req.params.module });
    res.status(201).json(record);
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.update = async (req, res) => {
  try {
    const record = await Record.findOneAndUpdate(
      { _id: req.params.id, module: req.params.module },
      req.body,
      { new: true, runValidators: true }
    );
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    const record = await Record.findOneAndDelete({ _id: req.params.id, module: req.params.module });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Record deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.dashboard = async (_req, res) => {
  try {
    const [students, present, attendanceRows, feeRows, helpdesk, notifications, assignments, exams] = await Promise.all([
      Record.countDocuments({ module: 'students' }),
      Record.countDocuments({ module: 'attendance', status: 'PRESENT' }),
      Record.find({ module: 'attendance' }).select('metadata status'),
      Record.find({ module: 'fees' }).select('amount metadata status'),
      Record.countDocuments({ module: 'helpdesk', status: { $nin: ['RESOLVED', 'CLOSED'] } }),
      Record.countDocuments({ module: 'notifications', status: { $ne: 'READ' } }),
      Record.countDocuments({ module: 'assignments', status: { $in: ['PENDING', 'OPEN'] } }),
      Record.countDocuments({ module: 'exams' })
    ]);
    const percentages = attendanceRows.map(r => Number(r.metadata?.percentage)).filter(Number.isFinite);
    const attendance = percentages.length ? Math.round(percentages.reduce((a,b)=>a+b,0)/percentages.length) : (attendanceRows.length ? Math.round((present/attendanceRows.length)*100) : 0);
    const collected = feeRows.reduce((s,r)=>s+Number(r.amount||0),0);
    const due = feeRows.reduce((s,r)=>s+Number(r.metadata?.due||0),0);
    res.json({ students, attendance, fees: collected, feesDue: due, openHelpdesk: helpdesk, unreadNotifications: notifications, pendingAssignments: assignments, exams });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.ai = async (req, res) => {
  const text = String(req.body.message || '').toLowerCase();
  let reply = 'I can help with attendance, fees, timetable, certificates, hostel, transport, helpdesk, exams, assignments and career readiness.';
  if (text.includes('attendance')) reply = 'Your Smart Campus Attendance view shows subject-wise percentage, recent presence and an attendance-risk indicator. I can also guide you to subjects that need attention.';
  else if (text.includes('fee')) reply = 'Open Fees to see semester dues, paid amount, payment history and the secure payment action available in this demo.';
  else if (text.includes('career') || text.includes('job')) reply = 'Career Intelligence combines CGPA, skills, projects, internships, communication, technical and aptitude scores from the 200-student dataset to surface readiness and skill gaps.';
  else if (text.includes('certificate')) reply = 'Digital Certificates lets you request Bonafide, Character and Course Completion certificates, then track each request through Requested, Processing and Issued states.';
  else if (text.includes('transport') || text.includes('bus')) reply = 'Transport provides route, bus status, estimated arrival and a demo live-tracking timeline inspired by the GPS transport module.';
  else if (text.includes('hostel')) reply = 'Hostel Management shows room allocation, occupancy, facilities, warden information and complaint status.';
  else if (text.includes('exam')) reply = 'Exams shows upcoming schedules, subjects, marks and grades, while faculty/admin can create schedules in the demo.';
  res.json({ reply });
};
