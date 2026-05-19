const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  rescheduleAppointment,
  getAppointmentById,
  getAvailableSlots
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');
const { appointmentValidation, validate } = require('../middleware/validator');

// Public routes
router.get('/available-slots', getAvailableSlots);

// Protected routes
router.use(protect);

// Patient routes
router.post('/book', authorize('patient'), appointmentValidation, validate, bookAppointment);
router.put('/:id/cancel', authorize('patient'), cancelAppointment);
router.put('/:id/reschedule', authorize('patient'), rescheduleAppointment);

// Doctor routes
router.put('/:id/status', authorize('doctor'), updateAppointmentStatus);

// Common routes
router.get('/:id', getAppointmentById);

module.exports = router;