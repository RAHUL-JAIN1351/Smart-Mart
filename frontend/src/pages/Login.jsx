import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError, loadUser } from '../store/authSlice';
import './Auth.css';

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, user } = useSelector(state => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  // Redirect after login
  useEffect(() => {
    if (user) navigate('/');
    return () => dispatch(clearError());
  }, [user, navigate, dispatch]);

  // -------------------------
  // NORMAL LOGIN
  // -------------------------
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  // -------------------------
  // GOOGLE LOGIN (FIXED)
  // -------------------------
  const handleGoogleLogin = async () => {
    try {
      // 1. Open Google popup
      const result = await signInWithPopup(auth, googleProvider);

      // 2. Get Firebase token
      const firebaseToken = await result.user.getIdToken();

      // 3. Send token to backend

      const res = await axios.post(
  `${import.meta.env.VITE_API_URL}/google`,
  { token: firebaseToken }
);

      // 4. Save JWT from backend
      localStorage.setItem("token", res.data.token);

      // 5. Load full user (VERY IMPORTANT)
      await dispatch(loadUser());

      toast.success("Google login successful 🎉");

      // 6. Redirect
      navigate('/');

    } catch (err) {
      console.error("GOOGLE LOGIN ERROR:", err?.response?.data || err);
      toast.error("Google login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">🛍 SmartMart+</div>

        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in to your account</p>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <button
            className="btn btn-primary btn-lg btn-full"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Join SmartMart+</Link>
        </p>

        {/* DIVIDER */}
        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* GOOGLE BUTTON */}
        <div className="google-btn" onClick={handleGoogleLogin}>
          🔵 Continue with Google
        </div>

      </div>
    </div>
  );
};

export default Login;