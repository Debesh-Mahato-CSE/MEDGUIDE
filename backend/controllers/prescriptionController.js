const db = require('../config/database');
const { generatePrescriptionPDF } = require('../utils/pdfGenerator');
const { sendEmail } = require('../utils/emailService');

// Create Prescription
exports.createPrescription = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      patientId,
      appointmentId,
      diagnosis,
      medicines,
      notes,
      followUpDate
    } = req.body;

    // Get doctor ID
    const [doctors] = await db.query(
      'SELECT id, full_name, specialization, license_number, clinic_name FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const doctor = doctors[0];

    // Get patient details
    const [patients] = await db.query(
      'SELECT id, full_name, age, gender, email FROM patients WHERE id = ?',
      [patientId]
    );

    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const patient = patients[0];

    // Generate prescription number
    const prescriptionNumber = 'PRX' + Date.now();

    // Insert prescription
    const [result] = await db.query(
      `INSERT INTO prescriptions 
       (prescription_number, doctor_id, patient_id, appointment_id, diagnosis, 
        medicines, notes, follow_up_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [prescriptionNumber, doctor.id, patientId, appointmentId, diagnosis,
       JSON.stringify(medicines), notes, followUpDate]
    );

    const prescriptionId = result.insertId;

    // Generate PDF
    const pdfData = {
      prescriptionNumber,
      doctorName: doctor.full_name,
      specialization: doctor.specialization,
      licenseNumber: doctor.license_number,
      clinicName: doctor.clinic_name,
      patientName: patient.full_name,
      patientAge: patient.age,
      patientGender: patient.gender,
      prescriptionDate: new Date(),
      diagnosis,
      medicines,
      notes
    };

    const pdfFileName = await generatePrescriptionPDF(pdfData);

    // Update prescription with PDF path
    await db.query(
      'UPDATE prescriptions SET pdf_file = ? WHERE id = ?',
      ['/uploads/prescriptions/' + pdfFileName, prescriptionId]
    );

    // Create notification for patient
    await db.query(
      `INSERT INTO notifications 
       (user_id, type, title, message, created_at)
       VALUES ((SELECT user_id FROM patients WHERE id = ?), 'prescription', 'New Prescription', 'You have received a new prescription', NOW())`,
      [patientId]
    );

    // Send email to patient
    await sendEmail({
      to: patient.email,
      subject: 'New Prescription Available',
      html: `
        <h2>New Prescription</h2>
        <p>Dear ${patient.full_name},</p>
        <p>Dr. ${doctor.full_name} has created a new prescription for you.</p>
        <p>Prescription Number: ${prescriptionNumber}</p>
        <p>Please login to your account to view and download your prescription.</p>
      `
    });

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      prescriptionId,
      prescriptionNumber,
      pdfFile: '/uploads/prescriptions/' + pdfFileName
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create prescription',
      error: error.message
    });
  }
};

// Get Prescriptions (Doctor)
exports.getDoctorPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

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

    const offset = (page - 1) * limit;

    const [prescriptions] = await db.query(
      `SELECT p.*, 
        pt.full_name as patient_name,
        pt.age as patient_age,
        pt.gender as patient_gender,
        pt.profile_photo as patient_photo
       FROM prescriptions p
       LEFT JOIN patients pt ON p.patient_id = pt.id
       WHERE p.doctor_id = ?
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [doctorId, parseInt(limit), offset]
    );

    // Parse medicines JSON
    prescriptions.forEach(p => {
      if (p.medicines) {
        p.medicines = JSON.parse(p.medicines);
      }
    });

    res.json({
      success: true,
      count: prescriptions.length,
      prescriptions
    });
  } catch (error) {
    console.error('Get doctor prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get prescriptions',
      error: error.message
    });
  }
};

// Get Prescriptions (Patient)
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

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

    const offset = (page - 1) * limit;

    const [prescriptions] = await db.query(
      `SELECT p.*, 
        d.full_name as doctor_name,
        d.specialization,
        d.profile_photo as doctor_photo
       FROM prescriptions p
       LEFT JOIN doctors d ON p.doctor_id = d.id
       WHERE p.patient_id = ?
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [patientId, parseInt(limit), offset]
    );

    // Parse medicines JSON
    prescriptions.forEach(p => {
      if (p.medicines) {
        p.medicines = JSON.parse(p.medicines);
      }
    });

    res.json({
      success: true,
      count: prescriptions.length,
      prescriptions
    });
  } catch (error) {
    console.error('Get patient prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get prescriptions',
      error: error.message
    });
  }
};

// Get Prescription by ID
exports.getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT p.*, 
        d.full_name as doctor_name,
        d.specialization,
        d.license_number,
        d.clinic_name,
        d.profile_photo as doctor_photo,
        pt.full_name as patient_name,
        pt.age as patient_age,
        pt.gender as patient_gender,
        pt.blood_group as patient_blood_group,
        pt.profile_photo as patient_photo
       FROM prescriptions p
       LEFT JOIN doctors d ON p.doctor_id = d.id
       LEFT JOIN patients pt ON p.patient_id = pt.id
       WHERE p.id = ?
    `;

    // Add authorization
    if (userRole === 'doctor') {
      query += ` AND d.user_id = ?`;
    } else if (userRole === 'patient') {
      query += ` AND pt.user_id = ?`;
    }

    const [prescriptions] = await db.query(query, [id, userId]);

    if (prescriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    const prescription = prescriptions[0];
    
    // Parse medicines JSON
    if (prescription.medicines) {
      prescription.medicines = JSON.parse(prescription.medicines);
    }

    res.json({
      success: true,
      prescription
    });
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get prescription',
      error: error.message
    });
  }
};

// Delete Prescription
exports.deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;
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

    // Check if prescription belongs to doctor
    const [prescriptions] = await db.query(
      'SELECT id FROM prescriptions WHERE id = ? AND doctor_id = ?',
      [id, doctorId]
    );

    if (prescriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    await db.query('DELETE FROM prescriptions WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Prescription deleted successfully'
    });
  } catch (error) {
    console.error('Delete prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete prescription',
      error: error.message
    });
  }
};