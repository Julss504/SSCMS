const express = require('express');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  archiveEvent,
  restoreEvent,
  getUpcomingEvents,
  getEventsByFilter,
  updatePaymentStatus,
  checkPaymentStatus,
  approveRegistration,
  disapproveRegistration,
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getEvents).post(protect, authorize(['admin', 'officer']), createEvent);

router.get('/upcoming', protect, getUpcomingEvents);
router.get('/filter', protect, getEventsByFilter);

router
  .route('/:id')
  .get(protect, getEvent)
  .put(protect, authorize(['admin', 'officer']), updateEvent)
  .delete(protect, authorize(['admin']), deleteEvent);

router.put('/:id/payment/:studentId', protect, authorize(['admin', 'officer']), updatePaymentStatus);
router.get('/:id/payment-check/:studentId', protect, checkPaymentStatus);
router.put('/:id/approve/:studentId', protect, authorize(['admin', 'officer']), approveRegistration);
router.put('/:id/disapprove/:studentId', protect, authorize(['admin', 'officer']), disapproveRegistration);

// Archive/restore routes
router.patch('/:id/archive', protect, authorize(['admin']), archiveEvent);
router.patch('/:id/restore', protect, authorize(['admin']), restoreEvent);

module.exports = router;
