require('dotenv').config({ path: '.env' });
const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3005';
const ADMIN_EMAIL = 'admin@kumu.com';
const ADMIN_PASSWORD = 'admin123';

async function testPromoUsageTracking() {
  console.log('🚀 Testing Promo Code Usage Tracking...');

  try {
    // Step 1: Admin Login to get a token
    console.log('\n📝 Step 1: Logging in as admin...');
    const loginResponse = await axios.post(`${BACKEND_URL}/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    const adminToken = loginResponse.data.token;
    console.log('✅ Admin login successful');

    // Step 2: Create a test promo code
    console.log('\n📝 Step 2: Creating test promo code...');
    const createResponse = await axios.post(`${BACKEND_URL}/promo-codes`, {
      code: 'USAGETEST',
      name: 'Usage Test Code',
      type: 'percentage',
      value: 15,
      maxUses: 10,
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      influencerName: 'Test Influencer',
      influencerEmail: 'test@influencer.com',
      influencerSocialHandle: '@testinfluencer',
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('✅ Test promo code created:', createResponse.data.code);

    // Step 3: Check initial usage count
    console.log('\n📝 Step 3: Checking initial usage count...');
    const initialStats = await axios.get(`${BACKEND_URL}/promo-codes`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const testCode = initialStats.data.find(code => code.code === 'USAGETEST');
    console.log(`Initial usage count: ${testCode.usedCount}`);

    // Step 4: Simulate a checkout session with promo code usage
    console.log('\n📝 Step 4: Simulating checkout with promo code...');
    const checkoutResponse = await axios.post(`${BACKEND_URL}/stripe/create-checkout-session`, {
      productId: 'kumu-coaching-subscription',
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('✅ Checkout session created');

    // Step 5: Simulate successful payment (this would normally be called by Stripe webhook)
    console.log('\n📝 Step 5: Simulating successful payment processing...');
    console.log('Note: In a real scenario, this would be triggered by Stripe webhook');
    console.log('The handleCheckoutSuccess method would track promo code usage automatically');

    // Step 6: Check if usage was tracked (this would happen after real payment)
    console.log('\n📝 Step 6: Checking if usage tracking is working...');
    console.log('To test this properly:');
    console.log('1. Use the checkout URL with a real payment');
    console.log('2. Apply the promo code "USAGETEST" during checkout');
    console.log('3. Complete the payment');
    console.log('4. Check the usage count in the admin panel');

    console.log('\n🎉 Promo code usage tracking setup is ready!');
    console.log('📝 Test promo code: USAGETEST (15% off)');
    console.log('📝 Checkout URL:', checkoutResponse.data.url);

  } catch (error) {
    console.error('❌ Error testing promo usage tracking:', error.response ? error.response.data : error.message);
  }
}

testPromoUsageTracking();
