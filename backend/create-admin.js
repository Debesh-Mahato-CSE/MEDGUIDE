const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAdmin() {
  try {
    // Connect to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Connected to database');

    // Hash password
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('✅ Password hashed');

    // Delete existing admin
    await connection.execute(
      'DELETE FROM users WHERE email = ?',
      ['admin@medguide.com']
    );

    // Insert new admin
    const [result] = await connection.execute(
      `INSERT INTO users (email, password, role, full_name, phone, is_active, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      ['admin@medguide.com', hashedPassword, 'admin', 'System Administrator', '9999999999', 1]
    );

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@medguide.com');
    console.log('🔑 Password: admin123');
    console.log('🆔 User ID:', result.insertId);

    // Verify
    const [users] = await connection.execute(
      'SELECT id, email, role, full_name, is_active FROM users WHERE email = ?',
      ['admin@medguide.com']
    );

    console.log('\n✅ Verification:');
    console.table(users);

    await connection.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();