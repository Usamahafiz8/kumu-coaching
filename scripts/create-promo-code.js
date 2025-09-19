const axios = require('axios');
require('dotenv').config({ path: '../.env' });

// Configuration
const API_BASE_URL = 'http://localhost:3005';
const ADMIN_EMAIL = 'admin@kumu.com';
const ADMIN_PASSWORD = 'admin123';

async function createPromoCode() {
  try {
    console.log('🚀 Creating promo code...');

    // Step 1: Login as admin to get token
    console.log('📝 Step 1: Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Admin login successful');

    // Step 2: Create promo code
    console.log('📝 Step 2: Creating promo code...');
    const promoCodeData = {
      code: 'INFLUENCER20',
      name: 'Influencer 20% Off',
      description: 'Special discount for influencer partnerships',
      type: 'percentage',
      value: 20,
      minimumAmount: 0,
      maxUses: 100,
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      influencerName: 'John Doe',
      influencerEmail: 'john@influencer.com',
      influencerSocialHandle: '@johndoe',
      influencerNotes: 'Fitness influencer with 100k followers'
    };

    const createResponse = await axios.post(`${API_BASE_URL}/promo-codes`, promoCodeData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Promo code created successfully!');
    console.log('📊 Promo Code Details:');
    console.log(`   Code: ${createResponse.data.code}`);
    console.log(`   Name: ${createResponse.data.name}`);
    console.log(`   Type: ${createResponse.data.type}`);
    console.log(`   Value: ${createResponse.data.value}${createResponse.data.type === 'percentage' ? '%' : '$'}`);
    console.log(`   Influencer: ${createResponse.data.influencerName}`);
    console.log(`   Max Uses: ${createResponse.data.maxUses}`);
    console.log(`   Valid Until: ${new Date(createResponse.data.validUntil).toLocaleDateString()}`);

    // Step 3: Test validation
    console.log('\n📝 Step 3: Testing promo code validation...');
    const validateResponse = await axios.get(`${API_BASE_URL}/promo-codes/validate/INFLUENCER20?amount=100`);
    
    if (validateResponse.data.valid) {
      console.log('✅ Promo code validation successful!');
      console.log(`   Discount: $${validateResponse.data.discount}`);
      console.log(`   Final Amount: $${100 - validateResponse.data.discount}`);
    } else {
      console.log('❌ Promo code validation failed:', validateResponse.data.error);
    }

    // Step 4: Get statistics
    console.log('\n📝 Step 4: Getting promo code statistics...');
    const statsResponse = await axios.get(`${API_BASE_URL}/admin/promo-codes/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📊 Promo Code Statistics:');
    console.log(`   Total Promo Codes: ${statsResponse.data.totalPromoCodes}`);
    console.log(`   Active Promo Codes: ${statsResponse.data.activePromoCodes}`);
    console.log(`   Total Uses: ${statsResponse.data.totalUses}`);

    console.log('\n🎉 Promo code system is working perfectly!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the script
createPromoCode();
