const express = require('express');
const router = express.Router();
const {
  updateProfile,
  getProfile,
  getAllDoctors,
  getDoctorById,
  getAppointments,
  getDashboardStats,
  getSpecializations
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/all', getAllDoctors);
router.get('/specializations', getSpecializations);
router.get('/:id', getDoctorById);

// Protected routes - Doctor only
router.use(protect);
router.use(authorize('doctor'));

router.put('/profile', 
  upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'licenseDoc', maxCount: 1 },
    { name: 'degreeDoc', maxCount: 1 }
  ]), 
  updateProfile
);
router.get('/profile/me', getProfile);
router.get('/appointments/list', getAppointments);
router.get('/dashboard/stats', getDashboardStats);

module.exports = router;