const { Client } = require('pg');

async function createTestPromoCode() {
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

    // First, let's check if we have any influencers
    const influencersResult = await client.query('SELECT id, name, email FROM influencers LIMIT 5');
    console.log('Available influencers:', influencersResult.rows);

    if (influencersResult.rows.length === 0) {
      console.log('❌ No influencers found. Please create an influencer first.');
      return;
    }

    // Get the first influencer
    const influencer = influencersResult.rows[0];
    console.log('Using influencer:', influencer);

    // Check if commission fields exist
    const columnsResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'promo_codes' 
      AND column_name IN ('influencer_id', 'commission_percentage', 'total_commissions')
    `);

    if (columnsResult.rows.length === 0) {
      console.log('Adding commission fields...');
      await client.query(`
        ALTER TABLE promo_codes 
        ADD COLUMN IF NOT EXISTS influencer_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS commission_percentage DECIMAL(5,2) DEFAULT 10.00,
        ADD COLUMN IF NOT EXISTS total_commissions DECIMAL(10,2) DEFAULT 0.00;
      `);
      console.log('✅ Commission fields added');
    }

    // Create a test promo code
    const testPromoCode = {
      code: 'TESTINFLUENCER',
      name: 'Test Influencer Code',
      type: 'percentage',
      value: 20,
      influencer_id: influencer.id,
      influencer_name: influencer.name,
      commission_percentage: 15,
      max_uses: 50,
      status: 'active'
    };

    const insertResult = await client.query(`
      INSERT INTO promo_codes (
        code, name, type, value, influencer_id, influencer_name, 
        commission_percentage, max_uses, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING id
    `, [
      testPromoCode.code,
      testPromoCode.name,
      testPromoCode.type,
      testPromoCode.value,
      testPromoCode.influencer_id,
      testPromoCode.influencer_name,
      testPromoCode.commission_percentage,
      testPromoCode.max_uses,
      testPromoCode.status
    ]);

    console.log('✅ Test promo code created with ID:', insertResult.rows[0].id);
    console.log('🎉 Test data created successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createTestPromoCode();
