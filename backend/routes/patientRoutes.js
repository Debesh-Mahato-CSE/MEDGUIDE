const express = require('express');
const router = express.Router();
const {
  updateProfile,
  getProfile,
  getAppointments,
  getDashboardStats,
  getMedicalTimeline
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Protected routes - Patient only
router.use(protect);
router.use(authorize('patient'));

router.put('/profile', upload.single('profilePhoto'), updateProfile);
router.get('/profile/me', getProfile);
router.get('/appointments/list', getAppointments);
router.get('/dashboard/stats', getDashboardStats);
router.get('/timeline', getMedicalTimeline);

module.exports = router;