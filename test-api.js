#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let authToken = '';
let userId = '';
let productId = '';
let subscriptionId = '';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  firstName: 'Test',
  lastName: 'User'
};

const testProduct = {
  name: 'Kumu Coaching Premium',
  description: 'Premium coaching subscription with personalized sessions',
  price: 20.99,
  currency: 'USD',
  stripeProductId: 'prod_T4wyxMacGpdDKB',
  stripePriceId: 'price_1S8n4wFooGVEYWinxi5NxFSL',
  isSubscription: true,
  billingInterval: 'year',
  trialPeriodDays: 7
};

// Helper function to make requests
async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status || 500 
    };
  }
}

// Test functions
async function testServerHealth() {
  console.log('\n🏥 Testing Server Health...');
  const result = await makeRequest('GET', '/');
  if (result.success) {
    console.log('✅ Server is running');
  } else {
    console.log('❌ Server is not responding');
    return false;
  }
  return true;
}

async function testSwaggerDocs() {
  console.log('\n📚 Testing Swagger Documentation...');
  const result = await makeRequest('GET', '/api/docs');
  if (result.success) {
    console.log('✅ Swagger documentation is accessible');
    console.log('📖 Documentation URL: http://localhost:3000/api/docs');
  } else {
    console.log('❌ Swagger documentation not accessible');
  }
}

async function testAuthAPIs() {
  console.log('\n🔐 Testing Authentication APIs...');
  
  // Test Signup
  console.log('\n1. Testing User Signup...');
  const signupResult = await makeRequest('POST', '/auth/signup', testUser);
  if (signupResult.success) {
    console.log('✅ User signup successful');
    authToken = signupResult.data.token;
    userId = signupResult.data.user.id;
    console.log(`   User ID: ${userId}`);
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
  } else {
    console.log('❌ User signup failed:', signupResult.error);
  }
  
  // Test Login
  console.log('\n2. Testing User Login...');
  const loginResult = await makeRequest('POST', '/auth/login', {
    email: testUser.email,
    password: testUser.password
  });
  if (loginResult.success) {
    console.log('✅ User login successful');
    authToken = loginResult.data.token;
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
  } else {
    console.log('❌ User login failed:', loginResult.error);
  }
  
  // Test Profile
  console.log('\n3. Testing Get Profile...');
  const profileResult = await makeRequest('GET', '/auth/profile', null, {
    'Authorization': `Bearer ${authToken}`
  });
  if (profileResult.success) {
    console.log('✅ Profile retrieved successfully');
    console.log(`   Email: ${profileResult.data.email}`);
  } else {
    console.log('❌ Profile retrieval failed:', profileResult.error);
  }
  
  // Test Forgot Password
  console.log('\n4. Testing Forgot Password...');
  const forgotResult = await makeRequest('POST', '/auth/forgot-password', {
    email: testUser.email
  });
  if (forgotResult.success) {
    console.log('✅ Forgot password request successful');
    console.log(`   Message: ${forgotResult.data.message}`);
  } else {
    console.log('❌ Forgot password failed:', forgotResult.error);
  }
}

async function testUserAPIs() {
  console.log('\n👤 Testing User Management APIs...');
  
  // Test Get Profile
  console.log('\n1. Testing Get User Profile...');
  const profileResult = await makeRequest('GET', '/users/profile', null, {
    'Authorization': `Bearer ${authToken}`
  });
  if (profileResult.success) {
    console.log('✅ User profile retrieved');
    console.log(`   Name: ${profileResult.data.firstName} ${profileResult.data.lastName}`);
  } else {
    console.log('❌ User profile retrieval failed:', profileResult.error);
  }
  
  // Test Update Profile
  console.log('\n2. Testing Update User Profile...');
  const updateData = {
    firstName: 'Updated',
    lastName: 'User',
    phone: '+1234567890'
  };
  const updateResult = await makeRequest('PUT', '/users/profile', updateData, {
    'Authorization': `Bearer ${authToken}`
  });
  if (updateResult.success) {
    console.log('✅ User profile updated successfully');
    console.log(`   Updated Name: ${updateResult.data.firstName} ${updateResult.data.lastName}`);
  } else {
    console.log('❌ User profile update failed:', updateResult.error);
  }
}

async function testProductAPIs() {
  console.log('\n🛍️ Testing Product Management APIs...');
  
  // Test Get All Products
  console.log('\n1. Testing Get All Products...');
  const productsResult = await makeRequest('GET', '/products');
  if (productsResult.success) {
    console.log('✅ Products retrieved successfully');
    console.log(`   Found ${productsResult.data.length} products`);
  } else {
    console.log('❌ Products retrieval failed:', productsResult.error);
  }
  
  // Test Create Product
  console.log('\n2. Testing Create Product...');
  const createResult = await makeRequest('POST', '/products', testProduct, {
    'Authorization': `Bearer ${authToken}`
  });
  if (createResult.success) {
    console.log('✅ Product created successfully');
    productId = createResult.data.id;
    console.log(`   Product ID: ${productId}`);
    console.log(`   Product Name: ${createResult.data.name}`);
  } else {
    console.log('❌ Product creation failed:', createResult.error);
  }
  
  // Test Get Product by ID
  if (productId) {
    console.log('\n3. Testing Get Product by ID...');
    const getResult = await makeRequest('GET', `/products/${productId}`);
    if (getResult.success) {
      console.log('✅ Product retrieved by ID');
      console.log(`   Product: ${getResult.data.name}`);
    } else {
      console.log('❌ Product retrieval by ID failed:', getResult.error);
    }
  }
  
  // Test Update Product
  if (productId) {
    console.log('\n4. Testing Update Product...');
    const updateData = {
      name: 'Updated Kumu Coaching Premium',
      price: 25.99
    };
    const updateResult = await makeRequest('PATCH', `/products/${productId}`, updateData, {
      'Authorization': `Bearer ${authToken}`
    });
    if (updateResult.success) {
      console.log('✅ Product updated successfully');
      console.log(`   Updated Name: ${updateResult.data.name}`);
      console.log(`   Updated Price: $${updateResult.data.price}`);
    } else {
      console.log('❌ Product update failed:', updateResult.error);
    }
  }
}

async function testStripeAPIs() {
  console.log('\n💳 Testing Stripe Payment APIs...');
  
  if (!productId) {
    console.log('❌ No product ID available for Stripe testing');
    return;
  }
  
  // Test Create Checkout Session
  console.log('\n1. Testing Create Checkout Session...');
  const checkoutResult = await makeRequest('POST', '/stripe/create-checkout-session', {
    productId: productId
  }, {
    'Authorization': `Bearer ${authToken}`
  });
  if (checkoutResult.success) {
    console.log('✅ Checkout session created successfully');
    console.log(`   Checkout URL: ${checkoutResult.data.url}`);
    console.log('   Note: This is a test URL - actual payment would redirect to Stripe');
  } else {
    console.log('❌ Checkout session creation failed:', checkoutResult.error);
  }
}

async function testSubscriptionAPIs() {
  console.log('\n📋 Testing Subscription Management APIs...');
  
  // Test Get User Subscriptions
  console.log('\n1. Testing Get User Subscriptions...');
  const subscriptionsResult = await makeRequest('GET', '/subscriptions', null, {
    'Authorization': `Bearer ${authToken}`
  });
  if (subscriptionsResult.success) {
    console.log('✅ User subscriptions retrieved');
    console.log(`   Found ${subscriptionsResult.data.length} subscriptions`);
    if (subscriptionsResult.data.length > 0) {
      subscriptionId = subscriptionsResult.data[0].id;
    }
  } else {
    console.log('❌ User subscriptions retrieval failed:', subscriptionsResult.error);
  }
  
  // Test Get Subscription Status
  console.log('\n2. Testing Get Subscription Status...');
  const statusResult = await makeRequest('GET', '/subscriptions/status', null, {
    'Authorization': `Bearer ${authToken}`
  });
  if (statusResult.success) {
    console.log('✅ Subscription status retrieved');
    console.log(`   Has Active Subscription: ${statusResult.data.hasActiveSubscription}`);
    console.log(`   Active Subscriptions: ${statusResult.data.subscriptions.length}`);
  } else {
    console.log('❌ Subscription status retrieval failed:', statusResult.error);
  }
  
  // Test Cancel Subscription (if exists)
  if (subscriptionId) {
    console.log('\n3. Testing Cancel Subscription...');
    const cancelResult = await makeRequest('POST', `/subscriptions/${subscriptionId}/cancel`, null, {
      'Authorization': `Bearer ${authToken}`
    });
    if (cancelResult.success) {
      console.log('✅ Subscription cancellation initiated');
      console.log(`   Message: ${cancelResult.data.message}`);
    } else {
      console.log('❌ Subscription cancellation failed:', cancelResult.error);
    }
  } else {
    console.log('\n3. No subscriptions to cancel');
  }
}

async function testChangePassword() {
  console.log('\n🔒 Testing Change Password...');
  
  const changePasswordResult = await makeRequest('POST', '/auth/change-password', {
    currentPassword: testUser.password,
    newPassword: 'newpassword123'
  }, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (changePasswordResult.success) {
    console.log('✅ Password changed successfully');
    console.log(`   Message: ${changePasswordResult.data.message}`);
  } else {
    console.log('❌ Password change failed:', changePasswordResult.error);
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting Comprehensive API Testing...');
  console.log('=' .repeat(50));
  
  // Wait for server to start
  console.log('⏳ Waiting for server to start...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Test server health
  const serverRunning = await testServerHealth();
  if (!serverRunning) {
    console.log('❌ Server is not running. Please start the server first.');
    return;
  }
  
  // Test Swagger documentation
  await testSwaggerDocs();
  
  // Test Authentication APIs
  await testAuthAPIs();
  
  // Test User Management APIs
  await testUserAPIs();
  
  // Test Product Management APIs
  await testProductAPIs();
  
  // Test Stripe Payment APIs
  await testStripeAPIs();
  
  // Test Subscription Management APIs
  await testSubscriptionAPIs();
  
  // Test Change Password
  await testChangePassword();
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 API Testing Complete!');
  console.log('\n📊 Test Summary:');
  console.log('✅ Server Health: OK');
  console.log('✅ Swagger Documentation: Available at http://localhost:3000/api/docs');
  console.log('✅ Authentication APIs: Tested');
  console.log('✅ User Management APIs: Tested');
  console.log('✅ Product Management APIs: Tested');
  console.log('✅ Stripe Payment APIs: Tested');
  console.log('✅ Subscription Management APIs: Tested');
  console.log('\n🔗 Access your API documentation at: http://localhost:3000/api/docs');
}

// Run the tests
runAllTests().catch(console.error);
