#!/usr/bin/env node

/**
 * Database Reset Script for Spicera Premium
 * This script drops all tables and recreates them from scratch
 */

import { readFileSync } from 'fs';
import pkg from 'pg';
const { Client } = pkg;
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables
config();

async function resetDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_QxsO2Sr9mlRj@ep-blue-rain-af66v04d.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require',
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    
    console.log('🧹 Dropping existing tables...');
    await client.query(`
      DROP TABLE IF EXISTS order_items CASCADE;
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS cart_items CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS contact_submissions CASCADE;
    `);
    
    console.log('📄 Reading SQL setup file...');
    const sqlScript = readFileSync(resolve(__dirname, 'database-setup.sql'), 'utf8');
    
    console.log('🚀 Executing database setup...');
    await client.query(sqlScript);
    
    console.log('✅ Database reset completed successfully!');
    console.log('📦 4 premium masala products have been added to the products table');
    
    // Verify the setup
    const result = await client.query('SELECT COUNT(*) as count FROM products');
    console.log(`📊 Total products in database: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the reset
resetDatabase();