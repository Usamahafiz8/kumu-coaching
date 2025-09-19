const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const API_BASE_URL = 'http://localhost:3005';
const ADMIN_EMAIL = 'admin@kumu.com';
const ADMIN_PASSWORD = 'admin123';

async function testPromoIntegration() {
  try {
    console.log('🚀 Testing Promo Code Integration with Stripe...\n');

    // Step 1: Login as admin
    console.log('📝 Step 1: Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    const token = loginResponse.data.access_token;
    console.log('✅ Admin login successful\n');

    // Step 2: Create a test promo code
    console.log('📝 Step 2: Creating test promo code...');
    const promoCodeData = {
      code: 'TEST1',
      name: 'Test 10% Off',
      description: 'Test promo code for integration',
      type: 'percentage',
      value: 10,
      minimumAmount: 0,
      maxUses: 100,
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      influencerName: 'Test Influencer',
      influencerEmail: 'test@influencer.com',
      influencerSocialHandle: '@testinfluencer',
      influencerNotes: 'Test influencer for integration testing'
    };

    const createResponse = await axios.post(`${API_BASE_URL}/promo-codes`, promoCodeData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Test promo code created successfully!');
    console.log(`   Code: ${createResponse.data.code}`);
    console.log(`   Type: ${createResponse.data.type}`);
    console.log(`   Value: ${createResponse.data.value}%\n`);

    // Step 3: Test validation
    console.log('📝 Step 3: Testing promo code validation...');
    const validateResponse = await axios.get(`${API_BASE_URL}/promo-codes/validate/TEST1?amount=20.99`);
    
    if (validateResponse.data.valid) {
      console.log('✅ Promo code validation successful!');
      console.log(`   Discount: $${validateResponse.data.discount}`);
      console.log(`   Final Amount: $${(20.99 - validateResponse.data.discount).toFixed(2)}\n`);
    } else {
      console.log('❌ Promo code validation failed:', validateResponse.data.error);
      return;
    }

    // Step 4: Create a test user and checkout session
    console.log('📝 Step 4: Creating test checkout session...');
    
    // First, create a test user
    const userResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      email: 'testuser@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });
    
    const userToken = userResponse.data.access_token;
    console.log('✅ Test user created and logged in');

    // Create checkout session
    const checkoutResponse = await axios.post(`${API_BASE_URL}/stripe/create-checkout-session`, {
      productId: 'kumu-coaching-subscription'
    }, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Checkout session created!');
    console.log(`   URL: ${checkoutResponse.data.url}`);
    console.log('\n🎯 Now you can:');
    console.log('1. Open the checkout URL in your browser');
    console.log('2. Try entering "TEST1" as the promo code');
    console.log('3. The code should now work in Stripe checkout!');
    console.log('\n📝 Note: The promo code will be synced to Stripe automatically when creating checkout sessions.');

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testPromoIntegration();
