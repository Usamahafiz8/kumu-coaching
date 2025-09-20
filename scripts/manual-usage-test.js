require('dotenv').config({ path: '.env' });
const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3005';
const ADMIN_EMAIL = 'admin@kumu.com';
const ADMIN_PASSWORD = 'admin123';

async function testManualUsageTracking() {
  console.log('🚀 Testing Manual Promo Code Usage Tracking...');

  try {
    // Step 1: Admin Login to get a token
    console.log('\n📝 Step 1: Logging in as admin...');
    const loginResponse = await axios.post(`${BACKEND_URL}/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    const adminToken = loginResponse.data.token;
    console.log('✅ Admin login successful');

    // Step 2: Get current promo codes
    console.log('\n📝 Step 2: Getting current promo codes...');
    const promoCodesResponse = await axios.get(`${BACKEND_URL}/promo-codes`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    
    const testCode = promoCodesResponse.data.find(code => code.code === 'USAGETEST');
    if (testCode) {
      console.log(`✅ Found test code: ${testCode.code}`);
      console.log(`Current usage count: ${testCode.usedCount}`);
      
      // Step 3: Manually increment usage (simulating a successful payment)
      console.log('\n📝 Step 3: Manually incrementing usage count...');
      const useResponse = await axios.post(`${BACKEND_URL}/promo-codes/use/${testCode.code}`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      console.log('✅ Usage incremented:', useResponse.data.message);
      
      // Step 4: Check updated usage count
      console.log('\n📝 Step 4: Checking updated usage count...');
      const updatedResponse = await axios.get(`${BACKEND_URL}/promo-codes`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const updatedCode = updatedResponse.data.find(code => code.code === 'USAGETEST');
      console.log(`Updated usage count: ${updatedCode.usedCount}`);
      
      // Step 5: Check influencer stats
      console.log('\n📝 Step 5: Checking influencer performance...');
      const influencerStats = await axios.get(`${BACKEND_URL}/admin/promo-codes/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      console.log('Promo code stats:', influencerStats.data);
      
    } else {
      console.log('❌ Test promo code USAGETEST not found');
    }

  } catch (error) {
    console.error('❌ Error testing manual usage tracking:', error.response ? error.response.data : error.message);
  }
}

testManualUsageTracking();
