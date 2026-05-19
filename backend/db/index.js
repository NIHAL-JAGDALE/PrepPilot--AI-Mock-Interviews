import pg from 'pg';
import dotenv from 'dotenv';

// Ensure .env is loaded even if this module is imported before server.js
dotenv.config();

const { Pool } = pg;

// ─── POSTGRES CONNECTION POOL ─────────────────────────────
// Uses DATABASE_URL from environment for connection config.
// The pool manages up to 20 connections automatically —
// connections are reused across requests, not created per-query.
//
// Why a pool instead of a single client?
//   - Express handles concurrent requests; a single client would serialize them
//   - Pool auto-reconnects on transient failures
//   - Pool enforces connection limits to avoid overwhelming Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // max connections in pool
  idleTimeoutMillis: 30000,   // close idle connections after 30s
  connectionTimeoutMillis: 5000, // fail fast if DB unreachable
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }  // Railway Postgres requires SSL
    : false,
});

// Log pool connection events during development
pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('📦 New database connection established');
  }
});

pool.on('error', (err) => {
  console.error('💥 Unexpected database pool error:', err.message);
  // Don't exit — the pool will try to reconnect automatically
});

// ─── CONVENIENCE QUERY METHOD ─────────────────────────────
// Usage: import pool from './db/index.js';
//        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
//
// Always use parameterized queries ($1, $2) — NEVER concatenate user input.
export default pool;
