const express = require('express');
const router = express.Router();
const {
  addMedicine,
  updateMedicine,
  deleteMedicine,
  getAllMedicines,
  getMedicineById,
  getCategories,
  searchMedicines
} = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { medicineValidation, validate } = require('../middleware/validator');

// Public routes
router.get('/all', getAllMedicines);
router.get('/categories', getCategories);
router.get('/search', searchMedicines);
router.get('/:id', getMedicineById);

// Admin only routes
router.use(protect);
router.use(authorize('admin'));

router.post('/add', upload.single('medicineImage'), medicineValidation, validate, addMedicine);
router.put('/:id', upload.single('medicineImage'), updateMedicine);
router.delete('/:id', deleteMedicine);

module.exports = router;