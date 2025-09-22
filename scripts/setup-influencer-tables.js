const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupInfluencerTables() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'kumu_coaching',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/create-influencer-tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration
    await client.query(migrationSQL);
    console.log('✅ Influencer tables created successfully');

    // Create a sample admin influencer for testing
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await client.query(`
      INSERT INTO influencers (email, password, name, social_handle, status, total_earnings, pending_earnings, paid_earnings, total_commissions, active_commissions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (email) DO NOTHING
    `, [
      'influencer@kumu.com',
      hashedPassword,
      'Test Influencer',
      '@testinfluencer',
      'approved',
      1500.00,
      200.00,
      1300.00,
      25,
      5
    ]);

    console.log('✅ Sample influencer created');
    console.log('📧 Email: influencer@kumu.com');
    console.log('🔑 Password: admin123');

  } catch (error) {
    console.error('❌ Error setting up influencer tables:', error);
    throw error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  setupInfluencerTables()
    .then(() => {
      console.log('🎉 Setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupInfluencerTables };
