// Script to check admin user details
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkAdmin() {
  try {
    console.log('Checking admin user details...');
    
    // Get admin user details
    const adminUser = await sql`
      SELECT id, email, name, role, is_active FROM users WHERE email = 'admin@spicecraft.com'
    `;
    
    if (adminUser.length > 0) {
      console.log('✅ Admin user found:');
      console.log('ID:', adminUser[0].id);
      console.log('Email:', adminUser[0].email);
      console.log('Name:', adminUser[0].name);
      console.log('Role:', adminUser[0].role);
      console.log('Active:', adminUser[0].is_active);
    } else {
      console.log('❌ Admin user not found');
    }
    
    // Get all users to see what's in the database
    const allUsers = await sql`
      SELECT id, email, name, role FROM users ORDER BY role, email
    `;
    
    console.log('\n📋 All users in database:');
    allUsers.forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking admin user:', error.message);
  }
}

checkAdmin();