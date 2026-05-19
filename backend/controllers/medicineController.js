const db = require('../config/database');

// Add Medicine (Admin only)
exports.addMedicine = async (req, res) => {
  try {
    const {
      name,
      genericName,
      category,
      uses,
      sideEffects,
      dosage,
      warnings,
      drugInteractions,
      alternatives,
      manufacturer,
      price
    } = req.body;

    let medicineImage = null;
    if (req.file) {
      medicineImage = '/uploads/medicines/' + req.file.filename;
    }

    const [result] = await db.query(
      `INSERT INTO medicines 
       (name, generic_name, category, uses, side_effects, dosage, warnings, 
        drug_interactions, alternatives, manufacturer, price, medicine_image, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [name, genericName, category, uses, sideEffects, dosage, warnings,
       drugInteractions, alternatives, manufacturer, price, medicineImage]
    );

    res.status(201).json({
      success: true,
      message: 'Medicine added successfully',
      medicineId: result.insertId
    });
  } catch (error) {
    console.error('Add medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add medicine',
      error: error.message
    });
  }
};

// Update Medicine (Admin only)
exports.updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      genericName,
      category,
      uses,
      sideEffects,
      dosage,
      warnings,
      drugInteractions,
      alternatives,
      manufacturer,
      price
    } = req.body;

    let medicineImage = null;
    if (req.file) {
      medicineImage = '/uploads/medicines/' + req.file.filename;
    }

    const updateFields = [];
    const updateValues = [];

    const fields = {
      name,
      generic_name: genericName,
      category,
      uses,
      side_effects: sideEffects,
      dosage,
      warnings,
      drug_interactions: drugInteractions,
      alternatives,
      manufacturer,
      price,
      medicine_image: medicineImage
    };

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined && value !== null) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }

    if (updateFields.length > 0) {
      updateValues.push(id);
      await db.query(
        `UPDATE medicines SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        updateValues
      );
    }

    res.json({
      success: true,
      message: 'Medicine updated successfully'
    });
  } catch (error) {
    console.error('Update medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update medicine',
      error: error.message
    });
  }
};

// Delete Medicine (Admin only)
exports.deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM medicines WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Medicine deleted successfully'
    });
  } catch (error) {
    console.error('Delete medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete medicine',
      error: error.message
    });
  }
};

// Get All Medicines
exports.getAllMedicines = async (req, res) => {
  try {
    const { 
      search, 
      category, 
      sortBy = 'name',
      page = 1,
      limit = 20
    } = req.query;

    let query = 'SELECT * FROM medicines WHERE 1=1';
    const queryParams = [];

    if (search) {
      query += ` AND (name LIKE ? OR generic_name LIKE ? OR uses LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category) {
      query += ` AND category = ?`;
      queryParams.push(category);
    }

    // Get total count
    const [countResult] = await db.query(
      query.replace('SELECT *', 'SELECT COUNT(*) as total'),
      queryParams
    );

    const total = countResult[0].total;

    // Add sorting
    if (sortBy === 'name') {
      query += ` ORDER BY name ASC`;
    } else if (sortBy === 'price_low') {
      query += ` ORDER BY price ASC`;
    } else if (sortBy === 'price_high') {
      query += ` ORDER BY price DESC`;
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), offset);

    const [medicines] = await db.query(query, queryParams);

    res.json({
      success: true,
      count: medicines.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      medicines
    });
  } catch (error) {
    console.error('Get all medicines error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get medicines',
      error: error.message
    });
  }
};

// Get Medicine by ID
exports.getMedicineById = async (req, res) => {
  try {
    const { id } = req.params;

    const [medicines] = await db.query(
      'SELECT * FROM medicines WHERE id = ?',
      [id]
    );

    if (medicines.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    // Increment view count
    await db.query(
      'UPDATE medicines SET views = views + 1 WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      medicine: medicines[0]
    });
  } catch (error) {
    console.error('Get medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get medicine',
      error: error.message
    });
  }
};

// Get Medicine Categories
exports.getCategories = async (req, res) => {
  try {
    const [categories] = await db.query(
      `SELECT DISTINCT category, COUNT(*) as count 
       FROM medicines 
       WHERE category IS NOT NULL
       GROUP BY category
       ORDER BY count DESC`
    );

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: error.message
    });
  }
};

// Search Medicines (Advanced)
exports.searchMedicines = async (req, res) => {
  try {
    const { query: searchQuery } = req.query;

    if (!searchQuery || searchQuery.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const [medicines] = await db.query(
      `SELECT id, name, generic_name, category, price, medicine_image
       FROM medicines 
       WHERE name LIKE ? OR generic_name LIKE ? OR uses LIKE ?
       ORDER BY 
         CASE 
           WHEN name LIKE ? THEN 1
           WHEN generic_name LIKE ? THEN 2
           ELSE 3
         END
       LIMIT 20`,
      [
        `%${searchQuery}%`, 
        `%${searchQuery}%`, 
        `%${searchQuery}%`,
        `${searchQuery}%`,
        `${searchQuery}%`
      ]
    );

    res.json({
      success: true,
      count: medicines.length,
      medicines
    });
  } catch (error) {
    console.error('Search medicines error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search medicines',
      error: error.message
    });
  }
};