import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError, loadUser } from '../store/authSlice';
import './Auth.css';

// import { signInWithPopup } from "firebase/auth";
// import { auth, googleProvider } from "../firebase";
// import axios from "axios";
import { toast } from "react-toastify";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, user } = useSelector(state => state.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (user) navigate('/');
    return () => dispatch(clearError());
  }, [user, navigate, dispatch]);

  // NORMAL REGISTER
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(register(form));
  };

  //  GOOGLE REGISTER 
  // const handleGoogleRegister = async () => {
  //   try {
  //     const result = await signInWithPopup(auth, googleProvider);

  //     const firebaseToken = await result.user.getIdToken();

  //     const res = await axios.post("/api/auth/google", {
  //       token: firebaseToken
  //     });

  //     localStorage.setItem("token", res.data.token);

  //     // 🔥 VERY IMPORTANT
  //     await dispatch(loadUser());

  //     toast.success("Google signup successful 🎉");

  //     navigate("/");

  //   } catch (err) {
  //     console.error("GOOGLE REGISTER ERROR:", err?.response?.data || err);
  //     toast.error("Google signup failed");
  //   }
  // };

  const handleGoogleRegister = () => {
  window.location.href =
    "https://smartmart-backend-dzeh.onrender.com/api/auth/google";
};

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🛍 SmartMart+</div>

        <h1>Create Account</h1>
        <p className="auth-sub">Join SmartMart+ and earn loyalty rewards</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              required
              minLength={6}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button className="btn btn-primary btn-lg btn-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Join SmartMart+'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>

        <div className="auth-divider"><span>OR</span></div>

        <div className="google-btn" onClick={handleGoogleRegister}>
          🔵 Sign up with Google
        </div>
      </div>
    </div>
  );
};

export default Register;