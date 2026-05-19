const db = require('../config/database');
const { sendEmail, doctorVerificationEmail } = require('../utils/emailService');

// Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'patient') as total_patients,
        (SELECT COUNT(*) FROM users WHERE role = 'doctor') as total_doctors,
        (SELECT COUNT(*) FROM doctors WHERE verification_status = 'verified') as verified_doctors,
        (SELECT COUNT(*) FROM doctors WHERE verification_status = 'pending') as pending_doctors,
        (SELECT COUNT(*) FROM appointments) as total_appointments,
        (SELECT COUNT(*) FROM appointments WHERE status = 'pending') as pending_appointments,
        (SELECT COUNT(*) FROM appointments WHERE DATE(appointment_date) = CURDATE()) as today_appointments,
        (SELECT COUNT(*) FROM medicines) as total_medicines,
        (SELECT COUNT(*) FROM prescriptions) as total_prescriptions,
        (SELECT COUNT(*) FROM reviews) as total_reviews,
        (SELECT AVG(rating) FROM reviews) as avg_rating
    `);

    // Get monthly registration trends
    const [registrationTrends] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM users
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `);

    // Get appointment trends
    const [appointmentTrends] = await db.query(`
      SELECT 
        DATE(appointment_date) as date,
        COUNT(*) as count
      FROM appointments
      WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY date
      ORDER BY date ASC
    `);

    // Get top specializations
    const [topSpecializations] = await db.query(`
      SELECT 
        d.specialization,
        COUNT(a.id) as appointment_count
      FROM doctors d
      LEFT JOIN appointments a ON d.id = a.doctor_id
      WHERE d.specialization IS NOT NULL
      GROUP BY d.specialization
      ORDER BY appointment_count DESC
      LIMIT 10
    `);

    // Get top doctors
    const [topDoctors] = await db.query(`
      SELECT 
        d.id,
        d.full_name,
        d.specialization,
        d.profile_photo,
        COUNT(a.id) as appointment_count,
        AVG(r.rating) as avg_rating
      FROM doctors d
      LEFT JOIN appointments a ON d.id = a.doctor_id
      LEFT JOIN reviews r ON d.id = r.doctor_id
      WHERE d.verification_status = 'verified'
      GROUP BY d.id
      ORDER BY appointment_count DESC
      LIMIT 10
    `);

    // Get revenue stats
    const [revenueStats] = await db.query(`
      SELECT 
        SUM(consultation_fee) as total_revenue,
        SUM(CASE WHEN MONTH(appointment_date) = MONTH(CURDATE()) THEN consultation_fee ELSE 0 END) as monthly_revenue,
        SUM(CASE WHEN DATE(appointment_date) = CURDATE() THEN consultation_fee ELSE 0 END) as daily_revenue
      FROM appointments
      WHERE status = 'completed'
    `);

    res.json({
      success: true,
      stats: stats[0],
      registrationTrends,
      appointmentTrends,
      topSpecializations,
      topDoctors,
      revenueStats: revenueStats[0]
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard stats',
      error: error.message
    });
  }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;

    let query = 'SELECT id, email, role, full_name, phone, is_active, created_at, last_login FROM users WHERE 1=1';
    const queryParams = [];

    if (role) {
      query += ' AND role = ?';
      queryParams.push(role);
    }

    if (status === 'active') {
      query += ' AND is_active = 1';
    } else if (status === 'inactive') {
      query += ' AND is_active = 0';
    }

    if (search) {
      query += ' AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Get total count
    const [countResult] = await db.query(
      query.replace('SELECT id, email, role, full_name, phone, is_active, created_at, last_login', 'SELECT COUNT(*) as total'),
      queryParams
    );

    const total = countResult[0].total;

    query += ' ORDER BY created_at DESC';

    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    const [users] = await db.query(query, queryParams);

    res.json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
};

// Get Pending Doctors
exports.getPendingDoctors = async (req, res) => {
  try {
    const [doctors] = await db.query(`
      SELECT d.*, u.email, u.created_at as registration_date
      FROM doctors d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.verification_status = 'pending'
      ORDER BY d.created_at DESC
    `);

    res.json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    console.error('Get pending doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending doctors',
      error: error.message
    });
  }
};

// Verify Doctor
exports.verifyDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    // Get doctor details
    const [doctors] = await db.query(
      'SELECT d.*, u.email FROM doctors d LEFT JOIN users u ON d.user_id = u.id WHERE d.id = ?',
      [id]
    );

    if (doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const doctor = doctors[0];

    // Update verification status
    await db.query(
      'UPDATE doctors SET verification_status = ?, rejection_reason = ?, verified_at = NOW() WHERE id = ?',
      [status, rejectionReason, id]
    );

    // Send email notification
    await sendEmail({
      to: doctor.email,
      subject: status === 'verified' ? 'Account Verified' : 'Account Verification Failed',
      html: doctorVerificationEmail(doctor.full_name, status)
    });

    // Create notification
    await db.query(
      `INSERT INTO notifications 
       (user_id, type, title, message, created_at)
       VALUES (?, 'verification', 'Account Verification Update', ?, NOW())`,
      [doctor.user_id, status === 'verified' ? 'Your account has been verified' : `Your account verification was rejected. Reason: ${rejectionReason || 'Not specified'}`]
    );

    res.json({
      success: true,
      message: `Doctor ${status} successfully`
    });
  } catch (error) {
    console.error('Verify doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify doctor',
      error: error.message
    });
  }
};

// Toggle User Status
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.query(
      'SELECT is_active FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const newStatus = !users[0].is_active;

    await db.query(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [newStatus, id]
    );

    res.json({
      success: true,
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [users] = await db.query(
      'SELECT role FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user (cascade will handle related records)
    await db.query('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// Get All Appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;

    let query = `
      SELECT a.*, 
        d.full_name as doctor_name,
        d.specialization,
        p.full_name as patient_name
      FROM appointments a
      LEFT JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN patients p ON a.patient_id = p.id
      WHERE 1=1
    `;

    const queryParams = [];

    if (status) {
      query += ' AND a.status = ?';
      queryParams.push(status);
    }

    if (date) {
      query += ' AND DATE(a.appointment_date) = ?';
      queryParams.push(date);
    }

    query += ' ORDER BY a.created_at DESC';

    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    const [appointments] = await db.query(query, queryParams);

    res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments',
      error: error.message
    });
  }
};