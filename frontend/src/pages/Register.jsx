// Register.jsx — redirects to Login with register tab pre-selected
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  useEffect(() => {
    // The Login page now handles both login and register via tab switching
    // We just redirect to /login; the user can switch to the register tab
    navigate('/login', { replace: true, state: { tab: 'register' } });
  }, [navigate]);
  return null;
}
