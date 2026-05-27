import { Navigate } from 'react-router-dom';

// ─── PROTECTED ROUTE ──────────────────────────────────────
// Wraps routes that require authentication.
// Checks for JWT token in localStorage — if missing, redirects to /login.
//
// Usage:
//   <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('preppilot_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
