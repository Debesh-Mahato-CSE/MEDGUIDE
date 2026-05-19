const db = require('../config/database');

// Update Patient Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      fullName,
      phone,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      city,
      state,
      pincode,
      allergies,
      existingDiseases,
      currentMedications,
      height,
      weight,
      smokingHabit,
      alcoholConsumption,
      emergencyContactName,
      emergencyContactRelation,
      emergencyContactPhone
    } = req.body;

    // Get patient ID
    const [patients] = await db.query(
      'SELECT id FROM patients WHERE user_id = ?',
      [userId]
    );

    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const patientId = patients[0].id;

    // Handle profile photo
    let profilePhoto = null;
    if (req.file) {
      profilePhoto = '/uploads/profiles/' + req.file.filename;
    }

    // Calculate age from date of birth
    let age = null;
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // Update patient profile
    const updateFields = [];
    const updateValues = [];

    const fields = {
      full_name: fullName,
      phone,
      date_of_birth: dateOfBirth,
      age,
      gender,
      blood_group: bloodGroup,
      address,
      city,
      state,
      pincode,
      allergies,
      existing_diseases: existingDiseases,
      current_medications: currentMedications,
      height,
      weight,
      smoking_habit: smokingHabit,
      alcohol_consumption: alcoholConsumption,
      emergency_contact_name: emergencyContactName,
      emergency_contact_relation: emergencyContactRelation,
      emergency_contact_phone: emergencyContactPhone,
      profile_photo: profilePhoto
    };

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined && value !== null) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }

    if (updateFields.length > 0) {
      updateValues.push(patientId);
      await db.query(
        `UPDATE patients SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
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

// Get Patient Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [patients] = await db.query(
      'SELECT * FROM patients WHERE user_id = ?',
      [userId]
    );

    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    res.json({
      success: true,
      patient: patients[0]
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

// Get Patient Appointments
exports.getAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;

    // Get patient ID
    const [patients] = await db.query(
      'SELECT id FROM patients WHERE user_id = ?',
      [userId]
    );

    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const patientId = patients[0].id;

    let query = `
      SELECT a.*, 
        d.full_name as doctor_name,
        d.specialization,
        d.clinic_name,
        d.clinic_address,
        d.profile_photo as doctor_photo,
        d.consultation_fee
      FROM appointments a
      LEFT JOIN doctors d ON a.doctor_id = d.id
      WHERE a.patient_id = ?
    `;

    const queryParams = [patientId];

    if (status) {
      query += ` AND a.status = ?`;
      queryParams.push(status);
    }

    query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;

    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), offset);

    const [appointments] = await db.query(query, queryParams);

    res.json({
      success: true,
      count: appointments.length,
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

// Get Patient Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get patient ID
    const [patients] = await db.query(
      'SELECT id FROM patients WHERE user_id = ?',
      [userId]
    );

    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const patientId = patients[0].id;

    // Get stats
    const [stats] = await db.query(
      `SELECT 
        (SELECT COUNT(*) FROM appointments WHERE patient_id = ? AND status = 'pending') as pending_appointments,
        (SELECT COUNT(*) FROM appointments WHERE patient_id = ? AND status = 'accepted' AND appointment_date >= CURDATE()) as upcoming_appointments,
        (SELECT COUNT(*) FROM appointments WHERE patient_id = ? AND status = 'completed') as completed_appointments,
        (SELECT COUNT(*) FROM prescriptions WHERE patient_id = ?) as total_prescriptions,
        (SELECT COUNT(*) FROM medical_reports WHERE patient_id = ?) as total_reports
      `,
      [patientId, patientId, patientId, patientId, patientId]
    );

    // Get upcoming appointments
    const [upcomingAppointments] = await db.query(
      `SELECT a.*, d.full_name as doctor_name, d.specialization, d.profile_photo as doctor_photo
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       WHERE a.patient_id = ? AND a.status IN ('pending', 'accepted') AND a.appointment_date >= CURDATE()
       ORDER BY a.appointment_date ASC, a.appointment_time ASC
       LIMIT 5`,
      [patientId]
    );

    // Get recent prescriptions
    const [recentPrescriptions] = await db.query(
      `SELECT p.*, d.full_name as doctor_name
       FROM prescriptions p
       LEFT JOIN doctors d ON p.doctor_id = d.id
       WHERE p.patient_id = ?
       ORDER BY p.created_at DESC
       LIMIT 5`,
      [patientId]
    );

    res.json({
      success: true,
      stats: stats[0],
      upcomingAppointments,
      recentPrescriptions
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

// Get Medical Timeline
exports.getMedicalTimeline = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get patient ID
    const [patients] = await db.query(
      'SELECT id FROM patients WHERE user_id = ?',
      [userId]
    );

    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const patientId = patients[0].id;

    // Get appointments
    const [appointments] = await db.query(
      `SELECT 
        'appointment' as type,
        a.id,
        a.appointment_date as date,
        a.status,
        a.reason,
        d.full_name as doctor_name,
        d.specialization
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       WHERE a.patient_id = ? AND a.status = 'completed'`,
      [patientId]
    );

    // Get prescriptions
    const [prescriptions] = await db.query(
      `SELECT 
        'prescription' as type,
        p.id,
        p.created_at as date,
        p.diagnosis,
        d.full_name as doctor_name
       FROM prescriptions p
       LEFT JOIN doctors d ON p.doctor_id = d.id
       WHERE p.patient_id = ?`,
      [patientId]
    );

    // Get reports
    const [reports] = await db.query(
      `SELECT 
        'report' as type,
        r.id,
        r.upload_date as date,
        r.report_type,
        r.report_name
       FROM medical_reports r
       WHERE r.patient_id = ?`,
      [patientId]
    );

    // Combine and sort by date
    const timeline = [...appointments, ...prescriptions, ...reports]
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      timeline
    });
  } catch (error) {
    console.error('Get medical timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get medical timeline',
      error: error.message
    });
  }
};