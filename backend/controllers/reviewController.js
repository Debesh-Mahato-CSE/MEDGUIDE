const db = require('../config/database');

// Add Review
exports.addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { doctorId, appointmentId, rating, comment } = req.body;

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

    // Check if appointment exists and is completed
    const [appointments] = await db.query(
      `SELECT id FROM appointments 
       WHERE id = ? AND patient_id = ? AND doctor_id = ? AND status = 'completed'`,
      [appointmentId, patientId, doctorId]
    );

    if (appointments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed appointments'
      });
    }

    // Check if already reviewed
    const [existingReviews] = await db.query(
      'SELECT id FROM reviews WHERE appointment_id = ?',
      [appointmentId]
    );

    if (existingReviews.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this appointment'
      });
    }

    // Insert review
    const [result] = await db.query(
      `INSERT INTO reviews 
       (doctor_id, patient_id, appointment_id, rating, comment, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [doctorId, patientId, appointmentId, rating, comment]
    );

    // Create notification for doctor
    await db.query(
      `INSERT INTO notifications 
       (user_id, type, title, message, created_at)
       VALUES ((SELECT user_id FROM doctors WHERE id = ?), 'review', 'New Review', 'You have received a new review', NOW())`,
      [doctorId]
    );

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      reviewId: result.insertId
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review',
      error: error.message
    });
  }
};

// Get Doctor Reviews
exports.getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const [reviews] = await db.query(
      `SELECT r.*, 
        p.full_name as patient_name,
        p.profile_photo as patient_photo
       FROM reviews r
       LEFT JOIN patients p ON r.patient_id = p.id
       WHERE r.doctor_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [doctorId, parseInt(limit), offset]
    );

    // Get rating statistics
    const [stats] = await db.query(
      `SELECT 
        AVG(rating) as avg_rating,
        COUNT(*) as total_reviews,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
       FROM reviews
       WHERE doctor_id = ?`,
      [doctorId]
    );

    res.json({
      success: true,
      count: reviews.length,
      reviews,
      statistics: stats[0]
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reviews',
      error: error.message
    });
  }
};

// Update Review
exports.updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { rating, comment } = req.body;

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

    // Check if review belongs to patient
    const [reviews] = await db.query(
      'SELECT id FROM reviews WHERE id = ? AND patient_id = ?',
      [id, patientId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await db.query(
      'UPDATE reviews SET rating = ?, comment = ?, updated_at = NOW() WHERE id = ?',
      [rating, comment, id]
    );

    res.json({
      success: true,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
};

// Delete Review
exports.deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

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

    // Check if review belongs to patient
    const [reviews] = await db.query(
      'SELECT id FROM reviews WHERE id = ? AND patient_id = ?',
      [id, patientId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await db.query('DELETE FROM reviews WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};