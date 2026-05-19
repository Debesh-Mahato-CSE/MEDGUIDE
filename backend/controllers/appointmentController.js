const db = require('../config/database');
const { sendEmail, appointmentConfirmation } = require('../utils/emailService');

// Book Appointment
exports.bookAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      doctorId,
      appointmentDate,
      appointmentTime,
      reason,
      priority = 'normal',
      symptoms
    } = req.body;

    // Get patient ID
    const [patients] = await db.query(
      'SELECT id, full_name, email FROM patients WHERE user_id = ?',
      [userId]
    );

    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const patient = patients[0];

    // Check if doctor exists and is verified
    const [doctors] = await db.query(
      'SELECT id, full_name, email, consultation_fee, verification_status FROM doctors WHERE id = ?',
      [doctorId]
    );

    if (doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const doctor = doctors[0];

    if (doctor.verification_status !== 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not verified yet'
      });
    }

    // Check if slot is available
    const [existingAppointments] = await db.query(
      `SELECT id FROM appointments 
       WHERE doctor_id = ? 
       AND appointment_date = ? 
       AND appointment_time = ? 
       AND status NOT IN ('cancelled', 'rejected')`,
      [doctorId, appointmentDate, appointmentTime]
    );

    if (existingAppointments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Generate appointment number
    const appointmentNumber = 'APT' + Date.now();

    // Create appointment
    const [result] = await db.query(
      `INSERT INTO appointments 
       (appointment_number, patient_id, doctor_id, appointment_date, appointment_time, 
        reason, symptoms, priority, status, consultation_fee, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NOW())`,
      [appointmentNumber, patient.id, doctorId, appointmentDate, appointmentTime, 
       reason, symptoms, priority, doctor.consultation_fee]
    );

    // Create notification for doctor
    await db.query(
      `INSERT INTO notifications 
       (user_id, type, title, message, created_at)
       VALUES ((SELECT user_id FROM doctors WHERE id = ?), 'appointment', 'New Appointment Request', ?, NOW())`,
      [doctorId, `New appointment request from ${patient.full_name}`]
    );

    // Send confirmation email to patient
    await sendEmail({
      to: patient.email,
      subject: 'Appointment Booking Confirmation',
      html: appointmentConfirmation(
        patient.full_name,
        doctor.full_name,
        appointmentDate,
        appointmentTime
      )
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointmentId: result.insertId,
      appointmentNumber
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment',
      error: error.message
    });
  }
};

// Update Appointment Status (Doctor)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status, rejectionReason, consultationNotes } = req.body;

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

    // Check if appointment belongs to this doctor
    const [appointments] = await db.query(
      `SELECT a.*, p.full_name as patient_name, p.email as patient_email
       FROM appointments a
       LEFT JOIN patients p ON a.patient_id = p.id
       WHERE a.id = ? AND a.doctor_id = ?`,
      [id, doctorId]
    );

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const appointment = appointments[0];

    // Update appointment
    const updateFields = ['status = ?', 'updated_at = NOW()'];
    const updateValues = [status];

    if (rejectionReason) {
      updateFields.push('rejection_reason = ?');
      updateValues.push(rejectionReason);
    }

    if (consultationNotes) {
      updateFields.push('consultation_notes = ?');
      updateValues.push(consultationNotes);
    }

    updateValues.push(id);

    await db.query(
      `UPDATE appointments SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Create notification for patient
    let notificationMessage = '';
    if (status === 'accepted') {
      notificationMessage = 'Your appointment has been accepted';
    } else if (status === 'rejected') {
      notificationMessage = `Your appointment has been rejected. Reason: ${rejectionReason || 'Not specified'}`;
    } else if (status === 'completed') {
      notificationMessage = 'Your appointment has been completed';
    }

    await db.query(
      `INSERT INTO notifications 
       (user_id, type, title, message, created_at)
       VALUES ((SELECT user_id FROM patients WHERE id = ?), 'appointment', 'Appointment Update', ?, NOW())`,
      [appointment.patient_id, notificationMessage]
    );

    // Send email notification
    await sendEmail({
      to: appointment.patient_email,
      subject: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      html: `
        <h2>Appointment Status Update</h2>
        <p>Dear ${appointment.patient_name},</p>
        <p>${notificationMessage}</p>
        <p>Appointment Number: ${appointment.appointment_number}</p>
        <p>Date: ${appointment.appointment_date}</p>
        <p>Time: ${appointment.appointment_time}</p>
      `
    });

    res.json({
      success: true,
      message: 'Appointment status updated successfully'
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment status',
      error: error.message
    });
  }
};

// Cancel Appointment (Patient)
exports.cancelAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { cancellationReason } = req.body;

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

    // Check if appointment belongs to this patient
    const [appointments] = await db.query(
      'SELECT * FROM appointments WHERE id = ? AND patient_id = ?',
      [id, patientId]
    );

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const appointment = appointments[0];

    // Check if appointment can be cancelled
    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed appointments cannot be cancelled'
      });
    }

    // Update appointment
    await db.query(
      `UPDATE appointments 
       SET status = 'cancelled', cancellation_reason = ?, updated_at = NOW() 
       WHERE id = ?`,
      [cancellationReason, id]
    );

    // Notify doctor
    await db.query(
      `INSERT INTO notifications 
       (user_id, type, title, message, created_at)
       VALUES ((SELECT user_id FROM doctors WHERE id = ?), 'appointment', 'Appointment Cancelled', ?, NOW())`,
      [appointment.doctor_id, `Appointment ${appointment.appointment_number} has been cancelled by patient`]
    );

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: error.message
    });
  }
};

// Reschedule Appointment
exports.rescheduleAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { newDate, newTime } = req.body;

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

    // Check if appointment exists
    const [appointments] = await db.query(
      'SELECT * FROM appointments WHERE id = ? AND patient_id = ?',
      [id, patientId]
    );

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const appointment = appointments[0];

    // Check if new slot is available
    const [existingAppointments] = await db.query(
      `SELECT id FROM appointments 
       WHERE doctor_id = ? 
       AND appointment_date = ? 
       AND appointment_time = ? 
       AND id != ?
       AND status NOT IN ('cancelled', 'rejected')`,
      [appointment.doctor_id, newDate, newTime, id]
    );

    if (existingAppointments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Update appointment
    await db.query(
      `UPDATE appointments 
       SET appointment_date = ?, appointment_time = ?, status = 'pending', updated_at = NOW() 
       WHERE id = ?`,
      [newDate, newTime, id]
    );

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully'
    });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule appointment',
      error: error.message
    });
  }
};

// Get Appointment Details
exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT a.*, 
        d.full_name as doctor_name,
        d.specialization,
        d.clinic_name,
        d.clinic_address,
        d.profile_photo as doctor_photo,
        p.full_name as patient_name,
        p.age as patient_age,
        p.gender as patient_gender,
        p.blood_group as patient_blood_group,
        p.profile_photo as patient_photo,
        p.allergies,
        p.existing_diseases
      FROM appointments a
      LEFT JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN patients p ON a.patient_id = p.id
      WHERE a.id = ?
    `;

    // Add authorization check
    if (userRole === 'doctor') {
      query += ` AND d.user_id = ?`;
    } else if (userRole === 'patient') {
      query += ` AND p.user_id = ?`;
    }

    const [appointments] = await db.query(query, [id, userId]);

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      appointment: appointments[0]
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointment',
      error: error.message
    });
  }
};

// Get Available Slots
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    // Get doctor's available time slots
    const [doctors] = await db.query(
      'SELECT available_time_slots FROM doctors WHERE id = ?',
      [doctorId]
    );

    if (doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const availableSlots = doctors[0].available_time_slots 
      ? JSON.parse(doctors[0].available_time_slots) 
      : [];

    // Get booked slots for the date
    const [bookedAppointments] = await db.query(
      `SELECT appointment_time FROM appointments 
       WHERE doctor_id = ? 
       AND appointment_date = ? 
       AND status NOT IN ('cancelled', 'rejected')`,
      [doctorId, date]
    );

    const bookedSlots = bookedAppointments.map(a => a.appointment_time);

    // Filter available slots
    const openSlots = availableSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({
      success: true,
      availableSlots: openSlots,
      bookedSlots
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available slots',
      error: error.message
    });
  }
};