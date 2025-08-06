// Debug authentication flow
// Using built-in fetch (Node.js 18+)

const BASE_URL = 'http://localhost:3000';

async function debugAuth() {
  try {
    console.log('🔍 Debugging authentication flow...');
    
    // Step 1: Login
    console.log('\n1️⃣ Attempting login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@spicecraft.com',
        password: 'admin123'
      })
    });
    
    console.log('Login status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login response:', JSON.stringify(loginData, null, 2));
    
    if (!loginData.success || !loginData.token) {
      console.log('❌ Login failed or no token received');
      return;
    }
    
    const token = loginData.token;
    console.log('✅ Token received:', token.substring(0, 20) + '...');
    
    // Step 2: Test token with /me endpoint
    console.log('\n2️⃣ Testing token with /me endpoint...');
    const meResponse = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Me endpoint status:', meResponse.status);
    const meData = await meResponse.json();
    console.log('Me response:', JSON.stringify(meData, null, 2));
    
    // Step 3: Test admin metrics
    console.log('\n3️⃣ Testing admin metrics...');
    const metricsResponse = await fetch(`${BASE_URL}/api/admin/metrics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Metrics status:', metricsResponse.status);
    const metricsData = await metricsResponse.json();
    console.log('Metrics response:', JSON.stringify(metricsData, null, 2));
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
}

debugAuth();