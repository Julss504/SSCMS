const express = require('express');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
  getEventsByFilter,
  updatePaymentStatus,
  checkPaymentStatus,
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getEvents).post(protect, createEvent);

router.get('/upcoming', protect, getUpcomingEvents);
router.get('/filter', protect, getEventsByFilter);

router
  .route('/:id')
  .get(protect, getEvent)
  .put(protect, updateEvent)
  .delete(protect, deleteEvent);

router.put('/:id/payment/:studentId', protect, updatePaymentStatus);
router.get('/:id/payment-check/:studentId', protect, checkPaymentStatus);

module.exports = router;
