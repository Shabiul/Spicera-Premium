const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function addAuditTable() {
  try {
    console.log('Adding audit_logs table...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "userid" varchar,
        "useremail" text,
        "userrole" text,
        "tablename" text NOT NULL,
        "recordid" text,
        "action" text NOT NULL,
        "olddata" text,
        "newdata" text,
        "ipaddress" text,
        "useragent" text,
        "createdat" timestamp DEFAULT now() NOT NULL
      )
    `;
    
    console.log('✅ audit_logs table created successfully!');
  } catch (error) {
    console.error('❌ Error creating audit_logs table:', error);
  }
}

addAuditTable();