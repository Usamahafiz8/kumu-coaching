const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check if admin already exists
    const existingAdmin = await client.query(
      'SELECT id FROM users WHERE email = $1 AND role = $2',
      ['admin@kumu.com', 'admin']
    );

    if (existingAdmin.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create admin user
    const result = await client.query(
      `INSERT INTO users (id, email, password, "firstName", "lastName", role, "isEmailVerified", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, email, "firstName", "lastName", role`,
      ['admin@kumu.com', hashedPassword, 'Admin', 'User', 'admin', true]
    );

    console.log('Admin user created successfully:');
    console.log('Email: admin@kumu.com');
    console.log('Password: admin123');
    console.log('User ID:', result.rows[0].id);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await client.end();
  }
}

createAdmin();
