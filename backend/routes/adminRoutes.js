const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getPendingDoctors,
  verifyDoctor,
  toggleUserStatus,
  deleteUser,
  getAllAppointments
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin authorization
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/doctors/pending', getPendingDoctors);
router.put('/doctors/:id/verify', verifyDoctor);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/appointments', getAllAppointments);

module.exports = router;