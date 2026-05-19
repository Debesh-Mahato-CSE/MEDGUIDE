const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// User profile routes will be handled by role-specific routes

module.exports = router;