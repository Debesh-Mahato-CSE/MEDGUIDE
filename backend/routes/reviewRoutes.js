const express = require('express');
const router = express.Router();
const {
  addReview,
  getDoctorReviews,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');
const { reviewValidation, validate } = require('../middleware/validator');

// Public routes
router.get('/doctor/:doctorId', getDoctorReviews);

// Protected routes - Patient only
router.use(protect);
router.use(authorize('patient'));

router.post('/add', reviewValidation, validate, addReview);
router.put('/:id', reviewValidation, validate, updateReview);
router.delete('/:id', deleteReview);

module.exports = router;