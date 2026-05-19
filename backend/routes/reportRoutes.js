const express = require('express');
const router = express.Router();
const {
  uploadReport,
  getPatientReports,
  deleteReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.use(authorize('patient'));

router.post('/upload', upload.single('reports'), uploadReport);
router.get('/list', getPatientReports);
router.delete('/:id', deleteReport);

module.exports = router;