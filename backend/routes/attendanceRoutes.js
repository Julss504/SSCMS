const express = require('express');
const {
  getAttendanceRecords,
  getAttendanceByEvent,
  getAttendanceByStudent,
  markAttendance,
  updateAttendance,
  updateAttendanceByEventAndStudent,
  deleteAttendance,
  archiveAttendance,
  restoreAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, authorize(['admin', 'officer']), getAttendanceRecords).post(protect, authorize(['admin', 'officer']), markAttendance);

router.get('/event/:eventId', protect, authorize(['admin', 'officer']), getAttendanceByEvent);
router.get('/student/:studentId', protect, authorize(['admin', 'officer']), getAttendanceByStudent);

router
  .route('/:id')
  .put(protect, authorize(['admin', 'officer']), updateAttendance)
  .delete(protect, authorize(['admin', 'officer']), deleteAttendance);

router.put('/event/:eventId/student/:studentId', protect, authorize(['admin', 'officer']), updateAttendanceByEventAndStudent);

// Archive/restore routes
router.patch('/:id/archive', protect, authorize(['admin']), archiveAttendance);
router.patch('/:id/restore', protect, authorize(['admin']), restoreAttendance);

module.exports = router;
