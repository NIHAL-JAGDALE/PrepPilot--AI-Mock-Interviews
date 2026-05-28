import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// ─── Step 20: Real Page Imports ───────────────────────────
// step20
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// ─── Step 21-25: Placeholder pages (replaced in order) ───
import Dashboard from './pages/Dashboard';

import InterviewSetup from './pages/InterviewSetup';
import Interview from './pages/Interview';
import Report from './pages/Report';

// ─── All pages wired for Steps 20-25 ─────────────────────

// ─── APP ROUTER ───────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/interview/new" element={
        <ProtectedRoute><InterviewSetup /></ProtectedRoute>
      } />
      <Route path="/interview/:id" element={
        <ProtectedRoute><Interview /></ProtectedRoute>
      } />
      <Route path="/report/:sessionId" element={
        <ProtectedRoute><Report /></ProtectedRoute>
      } />

      {/* 404 Fallback */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
            <p className="text-surface-200">Page not found</p>
            <a href="/" className="text-primary-400 hover:text-primary-300 mt-4 inline-block">
              ← Back to home
            </a>
          </div>
        </div>
      } />
    </Routes>
  );
}
