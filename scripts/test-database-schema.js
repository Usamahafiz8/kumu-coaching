const { Client } = require('pg');

async function testDatabaseSchema() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'kumu_coaching',
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if commission fields exist
    const result = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'promo_codes' 
      AND column_name IN ('influencer_id', 'commission_percentage', 'total_commissions')
    `);

    console.log('Commission fields found:', result.rows.map(row => row.column_name));

    if (result.rows.length === 0) {
      console.log('❌ Commission fields not found. Running migration...');
      
      // Run the migration
      const migrationSQL = `
        ALTER TABLE promo_codes 
        ADD COLUMN IF NOT EXISTS influencer_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS commission_percentage DECIMAL(5,2) DEFAULT 10.00,
        ADD COLUMN IF NOT EXISTS total_commissions DECIMAL(10,2) DEFAULT 0.00;
        
        CREATE INDEX IF NOT EXISTS idx_promo_codes_influencer_id ON promo_codes(influencer_id);
        
        UPDATE promo_codes 
        SET commission_percentage = 10.00 
        WHERE commission_percentage IS NULL;
      `;
      
      await client.query(migrationSQL);
      console.log('✅ Migration completed successfully!');
    } else {
      console.log('✅ Commission fields already exist');
    }

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

testDatabaseSchema();
