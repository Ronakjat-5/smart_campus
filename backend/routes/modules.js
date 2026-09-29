const express = require('express');
const router = express.Router();
const controller = require('../controllers/module');

const modules = [
  'students','faculty','attendance','assignments','exams','fees','notifications',
  'activities','hostel','transport','timetable','certificates','helpdesk','parent',
  'departments','courses'
];

modules.forEach((moduleName) => {
  router.get(`/${moduleName}`, (req, res) => {
    req.params.module = moduleName;
    controller.list(req, res);
  });
  router.post(`/${moduleName}`, (req, res) => {
    req.params.module = moduleName;
    controller.create(req, res);
  });
  router.put(`/${moduleName}/:id`, (req, res) => {
    req.params.module = moduleName;
    controller.update(req, res);
  });
  router.delete(`/${moduleName}/:id`, (req, res) => {
    req.params.module = moduleName;
    controller.remove(req, res);
  });
});

router.get('/dashboard', controller.dashboard);
router.post('/ai/chat', controller.ai);
module.exports = router;
