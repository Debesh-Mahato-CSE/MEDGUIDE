const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getDoctorPrescriptions,
  getPatientPrescriptions,
  getPrescriptionById,
  deletePrescription
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes
router.use(protect);

// Doctor routes
router.post('/create', authorize('doctor'), createPrescription);
router.get('/doctor/list', authorize('doctor'), getDoctorPrescriptions);
router.delete('/:id', authorize('doctor'), deletePrescription);

// Patient routes
router.get('/patient/list', authorize('patient'), getPatientPrescriptions);

// Common routes
router.get('/:id', getPrescriptionById);

module.exports = router;