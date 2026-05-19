const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/database');
const { sendEmail, welcomeEmail, passwordResetEmail } = require('../utils/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Register User
exports.register = async (req, res) => {
  try {
    const { email, password, role, fullName, phone } = req.body;

    // Check if user already exists
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (email, password, role, full_name, phone, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [email, hashedPassword, role, fullName, phone]
    );

    const userId = result.insertId;

    // Create role-specific profile
    if (role === 'patient') {
      await db.query(
        'INSERT INTO patients (user_id, full_name, email, phone, created_at) VALUES (?, ?, ?, ?, NOW())',
        [userId, fullName, email, phone]
      );
    } else if (role === 'doctor') {
      await db.query(
        'INSERT INTO doctors (user_id, full_name, email, phone, verification_status, created_at) VALUES (?, ?, ?, ?, "pending", NOW())',
        [userId, fullName, email, phone]
      );
    }

    // Send welcome email
    await sendEmail({
      to: email,
      subject: 'Welcome to MedGuide',
      html: welcomeEmail(fullName)
    });

    // Generate token
    const token = generateToken(userId);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: userId,
        email,
        role,
        fullName
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // For doctors, check verification status
    if (user.role === 'doctor') {
      const [doctors] = await db.query(
        'SELECT verification_status FROM doctors WHERE user_id = ?',
        [user.id]
      );

      if (doctors.length > 0 && doctors[0].verification_status === 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Your account is pending verification by admin'
        });
      }

      if (doctors.length > 0 && doctors[0].verification_status === 'rejected') {
        return res.status(403).json({
          success: false,
          message: 'Your account verification was rejected'
        });
      }
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get Current User
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let query = 'SELECT * FROM users WHERE id = ?';
    let profileQuery = '';

    if (role === 'patient') {
      profileQuery = 'SELECT * FROM patients WHERE user_id = ?';
    } else if (role === 'doctor') {
      profileQuery = 'SELECT * FROM doctors WHERE user_id = ?';
    }

    const [users] = await db.query(query, [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let profile = null;
    if (profileQuery) {
      const [profiles] = await db.query(profileQuery, [userId]);
      profile = profiles[0] || null;
    }

    const user = users[0];
    delete user.password;

    res.json({
      success: true,
      user: {
        ...user,
        profile
      }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
      error: error.message
    });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }

    const user = users[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save token to database
    await db.query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, resetTokenExpiry, user.id]
    );

    // Send email
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: passwordResetEmail(user.full_name, resetToken)
    });

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process request',
      error: error.message
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const [users] = await db.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    const user = users[0];

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    await db.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
};

// Logout
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};