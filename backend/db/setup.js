import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

// ─── SETUP ────────────────────────────────────────────────
// This script reads schema.sql and executes it against the
// Postgres database specified in DATABASE_URL.
//
// Usage: npm run db:setup
//
// It uses CREATE TABLE IF NOT EXISTS so it's safe to re-run —
// existing tables won't be dropped or modified.
// ──────────────────────────────────────────────────────────

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;

async function setup() {
  console.log('\n📦 PrepPilot Database Setup');
  console.log('═'.repeat(50));

  // Validate DATABASE_URL exists
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables.');
    console.error('   Copy .env.example to .env and fill in your Postgres connection string.');
    console.error('   Example: DATABASE_URL=postgresql://user:pass@localhost:5432/preppilot\n');
    process.exit(1);
  }

  // Read schema file
  const schemaPath = join(__dirname, 'schema.sql');
  let schema;
  try {
    schema = readFileSync(schemaPath, 'utf-8');
    console.log(`✅ Schema file loaded (${schema.length} bytes)`);
  } catch (err) {
    console.error(`❌ Failed to read schema.sql: ${err.message}`);
    process.exit(1);
  }

  // Connect to database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  });

  try {
    // Test connection first
    const { rows } = await pool.query('SELECT current_database() AS db, version() AS ver');
    console.log(`✅ Connected to database: ${rows[0].db}`);
    console.log(`   Postgres version: ${rows[0].ver.split(',')[0]}`);

    // Execute schema
    console.log('\n⏳ Running schema.sql...\n');
    await pool.query(schema);

    // Verify tables were created
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    const tables = tableCheck.rows.map(r => r.table_name);
    const expectedTables = ['dsa_problems', 'evaluations', 'messages', 'reports', 'sessions', 'users'];
    
    console.log('📋 Tables in database:');
    tables.forEach(t => {
      const expected = expectedTables.includes(t);
      console.log(`   ${expected ? '✅' : '➖'} ${t}`);
    });

    // Check all expected tables exist
    const missing = expectedTables.filter(t => !tables.includes(t));
    if (missing.length > 0) {
      console.error(`\n❌ Missing tables: ${missing.join(', ')}`);
      process.exit(1);
    }

    console.log(`\n🎉 All ${expectedTables.length} tables created successfully!`);
    console.log('═'.repeat(50) + '\n');

  } catch (err) {
    console.error(`\n❌ Database setup failed: ${err.message}`);
    if (err.message.includes('does not exist')) {
      console.error('\n💡 Hint: Make sure the "preppilot" database exists.');
      console.error('   Run this in psql:');
      console.error('   CREATE DATABASE preppilot;\n');
    }
    if (err.message.includes('password authentication failed') || err.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Hint: Check your DATABASE_URL in .env');
      console.error('   Make sure Postgres is running and credentials are correct.\n');
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setup();
