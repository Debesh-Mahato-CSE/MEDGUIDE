const { body, validationResult } = require('express-validator');

// Validation error handler
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Registration validation
exports.registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['patient', 'doctor']).withMessage('Role must be patient or doctor'),
  body('fullName').notEmpty().trim().withMessage('Full name is required')
];

// Login validation
exports.loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Appointment validation
exports.appointmentValidation = [
  body('doctorId').isInt().withMessage('Valid doctor ID is required'),
  body('appointmentDate').isDate().withMessage('Valid appointment date is required'),
  body('appointmentTime').notEmpty().withMessage('Appointment time is required'),
  body('reason').notEmpty().trim().withMessage('Reason for visit is required')
];

// Medicine validation
exports.medicineValidation = [
  body('name').notEmpty().trim().withMessage('Medicine name is required'),
  body('genericName').optional().trim(),
  body('uses').optional().trim(),
  body('sideEffects').optional().trim()
];

// Review validation
exports.reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim()
];