#!/usr/bin/env node

/**
 * Database Setup Script for Spicera Premium
 * This script creates the database tables and inserts initial product data
 */

import { readFileSync } from 'fs';
import { Client } from 'pg';
import { config } from 'dotenv';

// Load environment variables
config();

async function setupDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/spicera_db',
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    
    console.log('📄 Reading SQL setup file...');
    const sqlScript = readFileSync('./database-setup.sql', 'utf8');
    
    console.log('🚀 Executing database setup...');
    await client.query(sqlScript);
    
    console.log('✅ Database setup completed successfully!');
    console.log('📦 4 premium masala products have been added to the products table');
    
    // Verify the setup
    const result = await client.query('SELECT COUNT(*) as count FROM products');
    console.log(`📊 Total products in database: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the setup
setupDatabase();