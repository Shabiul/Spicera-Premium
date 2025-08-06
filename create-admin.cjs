// Script to create an admin user for testing
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcrypt');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function createAdmin() {
  try {
    console.log('Creating admin user...');
    
    // Check if admin user already exists
    const existingUser = await sql`
      SELECT * FROM users WHERE email = 'admin@spicecraft.com'
    `;
    
    if (existingUser.length > 0) {
      console.log('ℹ️  Admin user already exists');
      
      // Update role to admin if not already
      await sql`
        UPDATE users 
        SET role = 'admin' 
        WHERE email = 'admin@spicecraft.com'
      `;
      
      console.log('✅ Admin role updated!');
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Create admin user
      await sql`
        INSERT INTO users (email, password, name, role, is_active)
        VALUES ('admin@spicecraft.com', ${hashedPassword}, 'Admin User', 'admin', true)
      `;
      
      console.log('✅ Admin user created successfully!');
    }
    
    console.log('\n🔑 Admin credentials:');
    console.log('Email: admin@spicecraft.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
}

createAdmin();