import jwt from 'jsonwebtoken';

// ─── JWT AUTH MIDDLEWARE ───────────────────────────────────
// Protects routes by verifying the JWT token from the
// Authorization header. Attaches decoded user info to req.user.
//
// Usage in routes:
//   import auth from '../middleware/auth.js';
//   router.get('/protected', auth, (req, res) => {
//     console.log(req.user.userId); // UUID from token
//   });
//
// ⚠️ PITFALL (from instructions):
//   The axios interceptor on the frontend must read localStorage
//   on EVERY request — not just once at app init — so that the
//   token survives browser refreshes.
const auth = (req, res, next) => {
  try {
    // ── Extract token from header ──
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Access denied. No authorization header provided.',
      });
    }

    // Support both "Bearer <token>" and raw "<token>" formats
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        error: 'Access denied. No token provided.',
      });
    }

    // ── Verify token ──
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request object for downstream routes
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired. Please log in again.',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token. Please log in again.',
      });
    }

    console.error('Auth middleware error:', error.message);
    res.status(500).json({ error: 'Authentication failed.' });
  }
};

export default auth;
