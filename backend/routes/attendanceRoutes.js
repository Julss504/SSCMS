const express = require('express');
const {
  getAttendanceRecords,
  getAttendanceByEvent,
  getAttendanceByStudent,
  markAttendance,
  updateAttendance,
  updateAttendanceByEventAndStudent,
  deleteAttendance,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getAttendanceRecords).post(protect, markAttendance);

router.get('/event/:eventId', protect, getAttendanceByEvent);
router.get('/student/:studentId', protect, getAttendanceByStudent);

router
  .route('/:id')
  .put(protect, updateAttendance)
  .delete(protect, deleteAttendance);

router.put('/event/:eventId/student/:studentId', protect, updateAttendanceByEventAndStudent);

module.exports = router;
