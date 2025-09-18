#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://13.60.24.208:3000';

async function testEndpoint(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: { 'Content-Type': 'application/json', ...headers }
    };
    if (data) config.data = data;
    
    const response = await axios(config);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      status: error.response?.status || 500, 
      error: error.response?.data || error.message 
    };
  }
}

async function verifyStaging() {
  console.log('🔍 Verifying Staging Server...\n');
  
  // Test 1: Server Health
  console.log('1. Testing Server Health...');
  const health = await testEndpoint('GET', '/');
  console.log(health.success ? '✅ Server is running' : '❌ Server not responding');
  
  // Test 2: Swagger Documentation
  console.log('\n2. Testing Swagger Documentation...');
  const swagger = await testEndpoint('GET', '/api/docs');
  console.log(swagger.success ? '✅ Swagger docs accessible' : '❌ Swagger docs not accessible');
  
  // Test 3: Products API
  console.log('\n3. Testing Products API...');
  const products = await testEndpoint('GET', '/products');
  console.log(products.success ? '✅ Products API working' : '❌ Products API failed');
  if (products.success) {
    console.log(`   Found ${products.data.length} products`);
  }
  
  // Test 4: Auth API
  console.log('\n4. Testing Auth API...');
  const signup = await testEndpoint('POST', '/auth/signup', {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User'
  });
  console.log(signup.success ? '✅ Auth API working' : '❌ Auth API failed');
  
  if (signup.success) {
    console.log('   User registered successfully');
    console.log(`   Token: ${signup.data.token.substring(0, 20)}...`);
    
    // Test authenticated endpoint
    const profile = await testEndpoint('GET', '/auth/profile', null, {
      'Authorization': `Bearer ${signup.data.token}`
    });
    console.log(profile.success ? '✅ Authenticated endpoint working' : '❌ Authenticated endpoint failed');
  }
  
  // Test 5: Create Product
  if (signup.success) {
    console.log('\n5. Testing Product Creation...');
    const createProduct = await testEndpoint('POST', '/products', {
      name: 'Test Product',
      description: 'Test product description',
      price: 29.99,
      currency: 'USD',
      isActive: true,
      isSubscription: false
    }, {
      'Authorization': `Bearer ${signup.data.token}`
    });
    console.log(createProduct.success ? '✅ Product creation working' : '❌ Product creation failed');
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Staging Server Verification Complete!');
  console.log('🔗 API Documentation: http://13.60.24.208:3000/api/docs');
}

verifyStaging().catch(console.error);
