import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/index.js';

const router = express.Router();

// ─── REGISTER ─────────────────────────────────────────────
// POST /api/auth/register
// Body: { name, email, password }
// Returns: { token, user: { id, name, email } }
//
// Why 12 salt rounds? It's the sweet spot between security and
// speed (~250ms on modern hardware). 10 is too fast for brute-force
// resistance, 14+ adds noticeable latency to every registration.
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ── Validate input ──
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: name, email, password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters',
      });
    }

    // ── Check if email already exists ──
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'An account with this email already exists',
      });
    }

    // ── Hash password ──
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ── Insert user ──
    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name.trim(), email.toLowerCase().trim(), hashedPassword]
    );

    const user = result.rows[0];

    // ── Generate JWT ──
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ New user registered: ${user.email}`);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ─── LOGIN ────────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
// Returns: { token, user: { id, name, email } }
//
// Uses bcrypt.compare() which is timing-safe — it takes the
// same amount of time whether the password is wrong by 1 char
// or completely different. Prevents timing attacks.
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Validate input ──
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: email, password',
      });
    }

    // ── Find user by email ──
    const result = await pool.query(
      'SELECT id, name, email, password FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      // Generic message to prevent email enumeration
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    const user = result.rows[0];

    // ── Verify password ──
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    // ── Generate JWT ──
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ User logged in: ${user.email}`);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

export default router;
