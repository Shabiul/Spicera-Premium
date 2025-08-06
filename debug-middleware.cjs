// Debug middleware functions
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Test token from our debug output
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5M2Q3YjVjLTg3YWYtNGY2Ny05MjRmLWRlMzRkYWJhY2FiNiIsImVtYWlsIjoiYWRtaW5Ac3BpY2VjcmFmdC5jb20iLCJuYW1lIjoiQWRtaW4gVXNlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDQ3MzQ4NiwiZXhwIjoxNzU1MDc4Mjg2fQ.G32no4PwdqJ-f8tPMO7XMxND8d3SYHD0lZIMTQiKTxw';

console.log('🔍 Debugging middleware functions...');
console.log('JWT_SECRET:', JWT_SECRET);
console.log('Test token:', testToken.substring(0, 50) + '...');

// Test JWT verification
try {
  console.log('\n1️⃣ Testing JWT verification...');
  const decoded = jwt.verify(testToken, JWT_SECRET);
  console.log('✅ Token decoded successfully:');
  console.log('User ID:', decoded.id);
  console.log('Email:', decoded.email);
  console.log('Role:', decoded.role);
  console.log('Issued at:', new Date(decoded.iat * 1000));
  console.log('Expires at:', new Date(decoded.exp * 1000));
  
  // Test admin role check
  console.log('\n2️⃣ Testing admin role check...');
  if (decoded.role === 'admin') {
    console.log('✅ User has admin role');
  } else {
    console.log('❌ User does not have admin role, role is:', decoded.role);
  }
  
} catch (error) {
  console.error('❌ JWT verification failed:', error.message);
}

// Test Authorization header parsing
console.log('\n3️⃣ Testing Authorization header parsing...');
const authHeader = `Bearer ${testToken}`;
const extractedToken = authHeader && authHeader.split(' ')[1];
console.log('Auth header:', authHeader.substring(0, 50) + '...');
console.log('Extracted token matches:', extractedToken === testToken);

// Test environment variables
console.log('\n4️⃣ Environment check...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);
console.log('JWT_SECRET set:', !!process.env.JWT_SECRET);