const db = require('../config/database');
const path = require('path');

// Update Doctor Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      fullName,
      phone,
      specialization,
      qualification,
      experience,
      licenseNumber,
      medicalCouncil,
      clinicName,
      clinicAddress,
      city,
      state,
      pincode,
      mapsLink,
      consultationFee,
      languages,
      bio,
      availableDays,
      availableTimeSlots
    } = req.body;

    // Get doctor ID
    const [doctors] = await db.query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const doctorId = doctors[0].id;

    // Handle file uploads
    let profilePhoto = null;
    let licenseDocument = null;
    let degreeDocument = null;

    if (req.files) {
      if (req.files.profilePhoto) {
        profilePhoto = '/uploads/profiles/' + req.files.profilePhoto[0].filename;
      }
      if (req.files.licenseDoc) {
        licenseDocument = '/uploads/documents/' + req.files.licenseDoc[0].filename;
      }
      if (req.files.degreeDoc) {
        degreeDocument = '/uploads/documents/' + req.files.degreeDoc[0].filename;
      }
    }

    // Update doctor profile
    const updateFields = [];
    const updateValues = [];

    const fields = {
      full_name: fullName,
      phone,
      specialization,
      qualification,
      experience,
      license_number: licenseNumber,
      medical_council: medicalCouncil,
      clinic_name: clinicName,
      clinic_address: clinicAddress,
      city,
      state,
      pincode,
      maps_link: mapsLink,
      consultation_fee: consultationFee,
      languages,
      bio,
      available_days: availableDays,
      available_time_slots: availableTimeSlots,
      profile_photo: profilePhoto,
      license_document: licenseDocument,
      degree_document: degreeDocument
    };

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined && value !== null) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }

    if (updateFields.length > 0) {
      updateValues.push(doctorId);
      await db.query(
        `UPDATE doctors SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        updateValues
      );
    }

    // Update user table
    await db.query(
      'UPDATE users SET full_name = ?, phone = ? WHERE id = ?',
      [fullName, phone, userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Get Doctor Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [doctors] = await db.query(
      `SELECT d.*, 
        (SELECT AVG(rating) FROM reviews WHERE doctor_id = d.id) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE doctor_id = d.id) as review_count,
        (SELECT COUNT(*) FROM appointments WHERE doctor_id = d.id) as total_appointments
       FROM doctors d 
       WHERE d.user_id = ?`,
      [userId]
    );

    if (doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    res.json({
      success: true,
      doctor: doctors[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

// Get All Doctors (Public)
exports.getAllDoctors = async (req, res) => {
  try {
    const { 
      search, 
      specialization, 
      city, 
      minFee, 
      maxFee, 
      minRating,
      sortBy = 'rating',
      page = 1,
      limit = 10
    } = req.query;

    let query = `
      SELECT d.*, 
        (SELECT AVG(rating) FROM reviews WHERE doctor_id = d.id) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE doctor_id = d.id) as review_count
      FROM doctors d 
      WHERE d.verification_status = 'verified'
    `;

    const queryParams = [];

    if (search) {
      query += ` AND (d.full_name LIKE ? OR d.specialization LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (specialization) {
      query += ` AND d.specialization = ?`;
      queryParams.push(specialization);
    }

    if (city) {
      query += ` AND d.city = ?`;
      queryParams.push(city);
    }

    if (minFee) {
      query += ` AND d.consultation_fee >= ?`;
      queryParams.push(minFee);
    }

    if (maxFee) {
      query += ` AND d.consultation_fee <= ?`;
      queryParams.push(maxFee);
    }

    // Get total count
    const [countResult] = await db.query(
      query.replace('SELECT d.*, (SELECT AVG(rating) FROM reviews WHERE doctor_id = d.id) as avg_rating, (SELECT COUNT(*) FROM reviews WHERE doctor_id = d.id) as review_count', 'SELECT COUNT(*) as total'),
      queryParams
    );

    const total = countResult[0].total;

    // Add sorting
    if (sortBy === 'rating') {
      query += ` ORDER BY avg_rating DESC`;
    } else if (sortBy === 'experience') {
      query += ` ORDER BY d.experience DESC`;
    } else if (sortBy === 'fee_low') {
      query += ` ORDER BY d.consultation_fee ASC`;
    } else if (sortBy === 'fee_high') {
      query += ` ORDER BY d.consultation_fee DESC`;
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), offset);

    const [doctors] = await db.query(query, queryParams);

    // Filter by rating if specified
    let filteredDoctors = doctors;
    if (minRating) {
      filteredDoctors = doctors.filter(d => (d.avg_rating || 0) >= parseFloat(minRating));
    }

    res.json({
      success: true,
      count: filteredDoctors.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      doctors: filteredDoctors
    });
  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctors',
      error: error.message
    });
  }
};

// Get Doctor by ID (Public)
exports.getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const [doctors] = await db.query(
      `SELECT d.*, 
        (SELECT AVG(rating) FROM reviews WHERE doctor_id = d.id) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE doctor_id = d.id) as review_count,
        (SELECT COUNT(*) FROM appointments WHERE doctor_id = d.id AND status = 'completed') as completed_appointments
       FROM doctors d 
       WHERE d.id = ? AND d.verification_status = 'verified'`,
      [id]
    );

    if (doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get reviews
    const [reviews] = await db.query(
      `SELECT r.*, p.full_name as patient_name, p.profile_photo as patient_photo
       FROM reviews r
       LEFT JOIN patients p ON r.patient_id = p.id
       WHERE r.doctor_id = ?
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [id]
    );

    res.json({
      success: true,
      doctor: {
        ...doctors[0],
        reviews
      }
    });
  } catch (error) {
    console.error('Get doctor by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor',
      error: error.message
    });
  }
};

// Get Doctor Appointments
exports.getAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, date, page = 1, limit = 20 } = req.query;

    // Get doctor ID
    const [doctors] = await db.query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const doctorId = doctors[0].id;

    let query = `
      SELECT a.*, 
        p.full_name as patient_name,
        p.email as patient_email,
        p.phone as patient_phone,
        p.profile_photo as patient_photo,
        p.age as patient_age,
        p.gender as patient_gender,
        p.blood_group as patient_blood_group
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      WHERE a.doctor_id = ?
    `;

    const queryParams = [doctorId];

    if (status) {
      query += ` AND a.status = ?`;
      queryParams.push(status);
    }

    if (date) {
      query += ` AND DATE(a.appointment_date) = ?`;
      queryParams.push(date);
    }

    query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;

    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), offset);

    const [appointments] = await db.query(query, queryParams);

    // Get total count
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM appointments WHERE doctor_id = ?',
      [doctorId]
    );

    res.json({
      success: true,
      count: appointments.length,
      total: countResult[0].total,
      appointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments',
      error: error.message
    });
  }
};

// Get Doctor Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get doctor ID
    const [doctors] = await db.query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const doctorId = doctors[0].id;

    // Get stats
    const [stats] = await db.query(
      `SELECT 
        (SELECT COUNT(*) FROM appointments WHERE doctor_id = ? AND status = 'pending') as pending_appointments,
        (SELECT COUNT(*) FROM appointments WHERE doctor_id = ? AND DATE(appointment_date) = CURDATE()) as today_appointments,
        (SELECT COUNT(*) FROM appointments WHERE doctor_id = ? AND status = 'completed') as total_appointments,
        (SELECT COUNT(DISTINCT patient_id) FROM appointments WHERE doctor_id = ?) as total_patients,
        (SELECT AVG(rating) FROM reviews WHERE doctor_id = ?) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE doctor_id = ?) as total_reviews,
        (SELECT SUM(consultation_fee) FROM appointments WHERE doctor_id = ? AND status = 'completed' AND MONTH(appointment_date) = MONTH(CURDATE())) as monthly_earnings
      `,
      [doctorId, doctorId, doctorId, doctorId, doctorId, doctorId, doctorId]
    );

    // Get recent appointments
    const [recentAppointments] = await db.query(
      `SELECT a.*, p.full_name as patient_name, p.profile_photo as patient_photo
       FROM appointments a
       LEFT JOIN patients p ON a.patient_id = p.id
       WHERE a.doctor_id = ?
       ORDER BY a.created_at DESC
       LIMIT 5`,
      [doctorId]
    );

    // Get appointment trends (last 7 days)
    const [trends] = await db.query(
      `SELECT DATE(appointment_date) as date, COUNT(*) as count
       FROM appointments
       WHERE doctor_id = ? AND appointment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(appointment_date)
       ORDER BY date ASC`,
      [doctorId]
    );

    res.json({
      success: true,
      stats: stats[0],
      recentAppointments,
      trends
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

// Get Specializations List
exports.getSpecializations = async (req, res) => {
  try {
    const [specializations] = await db.query(
      `SELECT DISTINCT specialization, COUNT(*) as count 
       FROM doctors 
       WHERE verification_status = 'verified' AND specialization IS NOT NULL
       GROUP BY specialization
       ORDER BY count DESC`
    );

    res.json({
      success: true,
      specializations
    });
  } catch (error) {
    console.error('Get specializations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get specializations',
      error: error.message
    });
  }
};