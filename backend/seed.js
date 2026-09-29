require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');
const Record = require('./models/Record');

const today = new Date();
const d = days => new Date(today.getTime() + days * 86400000);
const record = (module, title, status, studentId = '', metadata = {}, amount = 0, date = today) => ({
  module, studentId: String(studentId || ''), title, status, date, amount, metadata
});

function feeForStudent(student, index) {
  const sid = String(student.student_id);
  if (sid === '1001') {
    return [
      record('fees', 'Semester 4 Tuition Fee', 'PAID', sid, { invoice: 'INV-2026-041', total: 65000, due: 0, method: 'UPI', transactionId: 'SC20260401' }, 65000, d(-18)),
      record('fees', 'Hostel & Mess', 'PARTIAL', sid, { invoice: 'HST-2026-018', total: 32000, due: 8000, method: 'Online' }, 24000, d(-8)),
      record('fees', 'Examination Fee', 'PENDING', sid, { invoice: 'EXM-2026-011', total: 4500, due: 4500, method: 'Online' }, 0, d(-2)),
      record('fees', 'Library Fee', 'PAID', sid, { invoice: 'LIB-2026-007', total: 2500, due: 0, method: 'UPI', transactionId: 'SC20260477' }, 2500, d(-5))
    ];
  }

  const tuition = 50000 + (index % 4) * 5000;
  const exam = 3500 + (index % 3) * 500;
  const library = 2000;
  const hostel = index % 2 === 0 ? 28000 : 0;
  const transport = index % 3 === 0 ? 9000 : 0;
  const ratio = 0.60 + (index % 8) * 0.05;
  const make = (title, total, code, offset) => {
    if (!total) return null;
    const paid = Math.round(total * ratio);
    const due = total - paid;
    return record('fees', title, due === 0 ? 'PAID' : 'PARTIAL', sid,
      { invoice: `${code}-2026-${String(index + 1).padStart(3, '0')}`, total, due, method: index % 2 ? 'UPI' : 'Online' },
      paid, d(offset));
  };
  return [
    make('Semester Tuition Fee', tuition, 'TUI', -10),
    make('Examination Fee', exam, 'EXM', -7),
    make('Library Fee', library, 'LIB', -5),
    make('Hostel & Mess', hostel, 'HST', -4),
    make('Transport Fee', transport, 'TRN', -3)
  ].filter(Boolean);
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  await User.deleteMany({});
  await Record.deleteMany({});
  console.log('Old users and records cleared');

  const dataPath = path.resolve(__dirname, '../data/students.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`Loaded ${data.length} students`);

  const users = [
    { name: 'Admin', email: 'admin@smartcampus.local', password: 'admin123', role: 'ADMIN' },
    { name: 'Faculty Demo', email: 'faculty@smartcampus.local', password: 'faculty123', role: 'FACULTY' },
    { name: 'Parent Demo', email: 'parent@smartcampus.local', password: 'parent123', role: 'PARENT', studentId: '1001' }
  ];

  for (const s of data) {
    users.push({
      name: s.name,
      email: s['Gmail ID'],
      password: 'student123',
      role: 'STUDENT',
      studentId: String(s.student_id)
    });
  }

  await User.create(users);
  console.log(`Created ${data.length} student login accounts`);

  const studentRecords = data.map(s => record(
    'students',
    s.name,
    s.employment_status || 'ACTIVE',
    s.student_id,
    s
  ));

  const feeRecords = data.flatMap((s, i) => feeForStudent(s, i));

  const demo = [];
  [
    ['Computer Science & Engineering','CSE','Software, AI and computing programs'],
    ['Electronics & Communication','ECE','Embedded systems and communication'],
    ['Information Technology','IT','Information systems and cloud computing'],
    ['Mechanical Engineering','ME','Design, manufacturing and automation'],
    ['Civil Engineering','CE','Infrastructure and smart construction'],
    ['Management Studies','MBA','Business and digital management']
  ].forEach(([title, code, description]) => demo.push(record('departments', title, 'ACTIVE', '', { code, description })));

  [
    ['B.Tech Computer Science','BTCS','8','Python, DBMS, Networks, AI'],
    ['B.Tech AI & Data Science','BTADS','8','Python, ML, Statistics, Data Engineering'],
    ['B.Tech Information Technology','BTIT','8','Web, Cloud, Cyber Security'],
    ['B.Tech ECE','BTECE','8','Embedded, VLSI, IoT'],
    ['B.Tech Mechanical','BTME','8','CAD, Robotics, Manufacturing'],
    ['MBA Digital Business','MBADB','4','Analytics, Marketing, Strategy']
  ].forEach(([title, code, duration, subjects]) => demo.push(record('courses', title, 'ACTIVE', '', { code, duration, subjects })));

  ['Dr. Ananya Mehta','Prof. Rajiv Singh','Dr. Neha Verma','Prof. Arjun Patel','Dr. Kavita Rao','Prof. Mohit Jain']
    .forEach((name, i) => demo.push(record('faculty', name, 'ACTIVE', '', {
      designation: i % 2 ? 'Professor' : 'Associate Professor',
      department: ['CSE','CSE','ECE','IT','ME','MBA'][i],
      email: name.toLowerCase().replace(/\s+/g, '.') + '@smartcampus.local',
      subjects: ['Data Structures','DBMS','AI','Networks']
    })));

  [
    ['Computer Networks','PRESENT',92],['Database Management Systems','PRESENT',88],['Data Structures','PRESENT',84],
    ['Operating Systems','ABSENT',76],['Artificial Intelligence','PRESENT',95],['Software Engineering','PRESENT',90]
  ].forEach(([title, status, percentage], i) => demo.push(record('attendance', title, status, '1001', {
    percentage, totalClasses: 25 + i, attendedClasses: Math.round((25 + i) * percentage / 100),
    teacher: ['Dr. Ananya Mehta','Prof. Rajiv Singh'][i % 2], semester: 4
  }, 0, d(-i))));

  demo.push(
    record('timetable','Data Structures','SCHEDULED','1001',{day:'Monday',time:'09:00 - 10:00',room:'LH-204',faculty:'Dr. Ananya Mehta',type:'Lecture'}),
    record('timetable','DBMS','SCHEDULED','1001',{day:'Monday',time:'11:00 - 12:00',room:'Lab-2',faculty:'Prof. Rajiv Singh',type:'Lab'}),
    record('timetable','Artificial Intelligence','SCHEDULED','1001',{day:'Tuesday',time:'10:00 - 11:00',room:'AI-Lab',faculty:'Dr. Neha Verma',type:'Lecture'}),
    record('timetable','Operating Systems','SCHEDULED','1001',{day:'Wednesday',time:'12:00 - 13:00',room:'LH-106',faculty:'Prof. Arjun Patel',type:'Lecture'}),
    record('timetable','Software Engineering','SCHEDULED','1001',{day:'Thursday',time:'09:00 - 10:00',room:'LH-302',faculty:'Dr. Kavita Rao',type:'Lecture'}),
    record('timetable','Project Studio','SCHEDULED','1001',{day:'Friday',time:'14:00 - 16:00',room:'Innovation Hub',faculty:'Mentor Panel',type:'Project'}),
    record('exams','Mid Semester Examination','UPCOMING','1001',{subject:'Data Structures',examDate:d(6),room:'Exam Hall A',maxMarks:100}),
    record('exams','Mid Semester Examination','UPCOMING','1001',{subject:'DBMS',examDate:d(8),room:'Exam Hall B',maxMarks:100}),
    record('exams','Unit Test 2','RESULT','1001',{subject:'Computer Networks',examDate:d(-20),maxMarks:50,marksObtained:43,grade:'A'}),
    record('exams','Unit Test 2','RESULT','1001',{subject:'AI Fundamentals',examDate:d(-18),maxMarks:50,marksObtained:46,grade:'A+'}),
    record('assignments','Network Security Case Study','PENDING','1001',{subject:'Computer Networks',dueDate:d(3),progress:45,marks:null}),
    record('assignments','SQL Optimization Lab','SUBMITTED','1001',{subject:'DBMS',dueDate:d(-2),progress:100,marks:18,total:20}),
    record('assignments','AI Ethics Reflection','PENDING','1001',{subject:'Artificial Intelligence',dueDate:d(7),progress:20,marks:null}),
    record('assignments','OS Scheduling Simulator','COMPLETED','1001',{subject:'Operating Systems',dueDate:d(-10),progress:100,marks:19,total:20}),
    record('hostel','Block A • Room 204 • Bed 2','ALLOCATED','1001',{block:'A',room:'204',bed:'2',warden:'Mr. S. Kulkarni',occupancy:'2 / 3',wifi:true,mess:true,laundry:true,maintenance:'No active issue'}),
    record('hostel','Hostel Complaint • Fan repair','RESOLVED','1001',{category:'Electrical',priority:'Medium',raised:d(-12),resolved:d(-10)}),
    record('transport','Route 3 • Bus MP09 SC 101','ON ROUTE','1001',{route:'Hostel → Main Campus',bus:'MP09 SC 101',driver:'Rakesh Sharma',eta:8,stop:'Vijay Nagar Gate',speed:'24 km/h',gps:'LIVE'}),
    record('transport','Route 1 • Bus MP09 SC 104','STANDBY','1001',{route:'City Centre → Campus',bus:'MP09 SC 104',driver:'Amit Verma',eta:18,stop:'Palasia',speed:'0 km/h',gps:'WAITING'}),
    record('certificates','Bonafide Certificate','ISSUED','1001',{type:'Bonafide',requestId:'CERT-1001-01',issuedOn:d(-20),verificationCode:'SC-BNF-7A91'}),
    record('certificates','Character Certificate','PROCESSING','1001',{type:'Character',requestId:'CERT-1001-02',expected:d(2)}),
    record('certificates','Course Completion Certificate','REQUESTED','1001',{type:'Course Completion',requestId:'CERT-1001-03'}),
    record('helpdesk','Library card issue','OPEN','1001',{ticket:'HD-2026-102',category:'Library',priority:'Medium',lastUpdate:d(-1)}),
    record('helpdesk','Wi-Fi access request','IN PROGRESS','1001',{ticket:'HD-2026-087',category:'IT Support',priority:'Low',lastUpdate:d(-3)}),
    record('helpdesk','Hostel maintenance','RESOLVED','1001',{ticket:'HD-2026-071',category:'Hostel',priority:'Low',lastUpdate:d(-10)}),
    record('notifications','Mid-semester timetable published','UNREAD','1001',{type:'Academic',action:'View timetable'}),
    record('notifications','Scholarship application window open','UNREAD','1001',{type:'Finance',action:'Apply before 30 Sep'}),
    record('notifications','Bus Route 3 delayed by 8 minutes','READ','1001',{type:'Transport',action:'Track bus'}),
    record('notifications','New AI lab resources available','READ','1001',{type:'Learning',action:'Open resources'}),
    record('activities','Hackathon Finalist — Smart India Campus','ACHIEVEMENT','1001',{type:'Hackathon',date:d(-30),description:'Built an AI-enabled digital campus prototype.'}),
    record('activities','Python for Data Science Certification','CERTIFICATION','1001',{type:'Certification',date:d(-45),description:'Completed industry-aligned certification.'}),
    record('activities','Open Source Contribution','PROJECT','1001',{type:'Project',date:d(-60),description:'Contributed bug fixes to a student developer project.'}),
    record('parent','Student Progress Snapshot','ACTIVE','1001',{studentName:'Rohan Sharma',attendance:88,cgpa:8.3,readiness:78,feeDue:12500,nextExam:'Data Structures',nextExamDate:d(6),mentor:'Dr. Ananya Mehta'})
  );

  await Record.insertMany([...studentRecords, ...feeRecords, ...demo]);

  console.log('\n==============================================');
  console.log('      SMART CAMPUS SEED COMPLETED');
  console.log('==============================================');
  console.log(`Students:       ${data.length}`);
  console.log(`Student logins: ${data.length}`);
  console.log(`Fee records:    ${feeRecords.length}`);
  console.log(`Other records:  ${studentRecords.length + demo.length - data.length}`);
  console.log(`Total records:  ${data.length + feeRecords.length + demo.length}`);
  console.log('----------------------------------------------');
  console.log('Student password: student123');
  console.log('Admin:            admin@smartcampus.local');
  console.log('Admin password:   admin123');
  console.log('Faculty:          faculty@smartcampus.local');
  console.log('Faculty password: faculty123');
  console.log('Parent:           parent@smartcampus.local');
  console.log('Parent password:  parent123');
  console.log('==============================================\n');

  await mongoose.disconnect();
  console.log('MongoDB disconnected');
})().catch(async e => {
  console.error(e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
