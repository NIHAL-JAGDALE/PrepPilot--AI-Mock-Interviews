import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db/index.js';
import authRoutes from './routes/auth.js';
import sessionRoutes from './routes/sessions.js';
import compilerRoutes from './routes/compiler.js';
import problemRoutes from './routes/problems.js';
import reportRoutes from './routes/reports.js';
import transcribeRoutes from './routes/transcribe.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─── MIDDLEWARE ────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : (origin, callback) => {
      // Allow any localhost port in development (Vite may use 5173, 5174, etc.)
      if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ─── HEALTH CHECK ─────────────────────────────────────────
// Simple route to verify the server is running and DB is reachable.
// Used by Railway health checks and manual debugging.
app.get('/api/health', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT NOW() AS server_time');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      serverTime: dbResult.rows[0].server_time,
    });
  } catch (error) {
    console.error('Health check failed:', error.message);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
    });
  }
});

// ─── ROUTES ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/compiler', compilerRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/transcribe', transcribeRoutes);

// ─── 404 HANDLER ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

// ─── START SERVER ─────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`\n🚀 PrepPilot backend running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});

// ─── GRACEFUL SHUTDOWN ────────────────────────────────────
// Ensures all DB connections are released and in-flight requests
// complete before the process exits. Prevents data corruption.
const shutdown = async (signal) => {
  console.log(`\n⚡ ${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    console.log('   HTTP server closed.');
    try {
      await pool.end();
      console.log('   Database pool closed.');
    } catch (err) {
      console.error('   Error closing database pool:', err.message);
    }
    console.log('   Goodbye! 👋\n');
    process.exit(0);
  });

  // Force shutdown if graceful takes too long (10s)
  setTimeout(() => {
    console.error('   Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
