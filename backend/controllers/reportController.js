const db = require('../config/database');

// Upload Medical Report
exports.uploadReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reportType, reportName, description, reportDate } = req.body;

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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = '/uploads/reports/' + req.file.filename;

    const [result] = await db.query(
      `INSERT INTO medical_reports 
       (patient_id, report_type, report_name, description, file_path, report_date, upload_date)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [patientId, reportType, reportName, description, filePath, reportDate]
    );

    res.status(201).json({
      success: true,
      message: 'Report uploaded successfully',
      reportId: result.insertId
    });
  } catch (error) {
    console.error('Upload report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload report',
      error: error.message
    });
  }
};

// Get Patient Reports
exports.getPatientReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reportType, page = 1, limit = 20 } = req.query;

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

    let query = 'SELECT * FROM medical_reports WHERE patient_id = ?';
    const queryParams = [patientId];

    if (reportType) {
      query += ' AND report_type = ?';
      queryParams.push(reportType);
    }

    query += ' ORDER BY report_date DESC, upload_date DESC';

    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    const [reports] = await db.query(query, queryParams);

    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reports',
      error: error.message
    });
  }
};

// Delete Report
exports.deleteReport = async (req, res) => {
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

    await db.query(
      'DELETE FROM medical_reports WHERE id = ? AND patient_id = ?',
      [id, patientId]
    );

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: error.message
    });
  }
};