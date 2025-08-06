// Simple test to verify admin dashboard updates
// This test simulates user registration and order creation to check if admin dashboard reflects changes

const BASE_URL = 'http://localhost:3000';

async function testDashboardUpdates() {
  console.log('🧪 Testing Admin Dashboard Updates...');
  
  try {
    // Step 1: Get initial metrics
    console.log('\n📊 Getting initial admin metrics...');
    const adminToken = await loginAsAdmin();
    const initialMetrics = await getAdminMetrics(adminToken);
    console.log('Initial metrics:', initialMetrics);
    
    // Step 2: Register a new user
    console.log('\n👤 Registering new test user...');
    const newUser = await registerNewUser();
    console.log('New user registered:', newUser.email);
    
    // Wait a moment for query invalidation to take effect
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 3: Check if metrics updated after user registration
    console.log('\n📊 Checking metrics after user registration...');
    const metricsAfterUser = await getAdminMetrics(adminToken);
    console.log('Metrics after user registration:', metricsAfterUser);
    
    if (metricsAfterUser.totalUsers > initialMetrics.totalUsers) {
      console.log('✅ User count updated correctly!');
    } else {
      console.log('❌ User count did not update');
    }
    
    // Step 4: Create an order as the new user
    console.log('\n🛒 Creating order as new user...');
    const newOrder = await createOrderAsUser(newUser.token);
    console.log('New order created:', newOrder.id);
    
    // Wait a moment for query invalidation to take effect
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 5: Check if metrics updated after order creation
    console.log('\n📊 Checking metrics after order creation...');
    const finalMetrics = await getAdminMetrics(adminToken);
    console.log('Final metrics:', finalMetrics);
    
    if (finalMetrics.totalOrders > metricsAfterUser.totalOrders) {
      console.log('✅ Order count updated correctly!');
    } else {
      console.log('❌ Order count did not update');
    }
    
    if (finalMetrics.totalRevenue > metricsAfterUser.totalRevenue) {
      console.log('✅ Revenue updated correctly!');
    } else {
      console.log('❌ Revenue did not update');
    }
    
    // Summary
    console.log('\n📋 Test Summary:');
    console.log(`Users: ${initialMetrics.totalUsers} → ${finalMetrics.totalUsers}`);
    console.log(`Orders: ${initialMetrics.totalOrders} → ${finalMetrics.totalOrders}`);
    console.log(`Revenue: ₹${initialMetrics.totalRevenue} → ₹${finalMetrics.totalRevenue}`);
    
    console.log('\n✅ Test completed successfully!');
    console.log('\n📝 Note: Test data (user and order) remains in database for manual verification.');
    console.log('   You can check the admin dashboard to see the updated counts.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

async function loginAsAdmin() {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@spicecraft.com',
      password: 'admin123'
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to login as admin');
  }
  
  const data = await response.json();
  return data.token;
}

async function getAdminMetrics(token: string) {
  const response = await fetch(`${BASE_URL}/api/admin/metrics`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) {
    throw new Error('Failed to get admin metrics');
  }
  
  return await response.json();
}

async function registerNewUser() {
  const timestamp = Date.now();
  const userData = {
    name: `Test User ${timestamp}`,
    email: `testuser${timestamp}@example.com`,
    password: 'password123',
    phone: '555-0123',
    address: '123 Test Street, Test City, TC 12345'
  };
  
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to register new user: ${errorData.error || response.statusText}`);
  }
  
  const data = await response.json();
  return {
    id: data.user.id,
    email: data.user.email,
    token: data.token
  };
}

async function createOrderAsUser(userToken: string) {
  // First, get a product to order
  const productsResponse = await fetch(`${BASE_URL}/api/products`);
  const products = await productsResponse.json();
  const product = products[0];
  
  if (!product) {
    throw new Error('No products available for testing');
  }
  
  // Add product to cart first
  const cartResponse = await fetch(`${BASE_URL}/api/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      productId: product.id,
      quantity: 2
    })
  });
  
  if (!cartResponse.ok) {
    const errorData = await cartResponse.json();
    throw new Error(`Failed to add to cart: ${errorData.error || cartResponse.statusText}`);
  }
  
  // Create order from cart
  const orderData = {
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    customerPhone: '555-0123',
    shippingAddress: '123 Test Street, Test City, TC 12345'
  };
  
  const response = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify(orderData)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to create order: ${errorData.error || response.statusText}`);
  }
  
  return await response.json();
}

// Run the test
testDashboardUpdates();