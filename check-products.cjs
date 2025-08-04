require('dotenv').config();
const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function checkProducts() {
  try {
    const result = await sql('SELECT * FROM products');
    console.log('Products in database:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

checkProducts().then(() => process.exit());