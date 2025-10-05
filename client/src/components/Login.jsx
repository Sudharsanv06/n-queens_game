import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import { OfflineAuth } from '../utils/offlineAuth';
import Layout from './Layout';
import './Login.css';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Login = () => {
  const [form, setForm] = useState({ 
    email: '', 
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let response;
      
      // Use offline authentication if on mobile or offline
      if (Capacitor.isNativePlatform() || !navigator.onLine) {
        response = await OfflineAuth.login(form);
        console.log('Offline login successful:', response);
      } else {
        // Try online authentication first
        try {
          const axiosResponse = await axios.post(`${API_BASE_URL}/auth/login`, form);
          response = axiosResponse.data;
          
          // For online login, also store in OfflineAuth format for consistency
          if (response.success) {
            // Create a session using OfflineAuth format
            localStorage.setItem('nqueens_current_user', JSON.stringify(response.user));
            const session = {
              userId: response.user.id || response.user._id,
              token: response.token,
              createdAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            };
            localStorage.setItem('nqueens_session', JSON.stringify(session));
            console.log('Online login successful:', response);
          }
        } catch (networkError) {
          console.log('Network error, falling back to offline auth:', networkError.message);
          
          // Check if it's a validation error from server
          if (networkError.response && networkError.response.data && networkError.response.data.message) {
            throw new Error(networkError.response.data.message);
          }
          
          // Fall back to offline authentication
          response = await OfflineAuth.login(form);
          console.log('Offline fallback login successful:', response);
        }
      }
      
      // Trigger a storage event to update other components
      window.dispatchEvent(new Event('storage'));
      
      console.log('Login completed successfully');
      alert('Login successful! Welcome back!');
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="login-page">
        <div className="login-container">
          <div className="login-header">
            <h1>Welcome Back!</h1>
            <p>Sign in to continue your N-Queens journey</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>

            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="signup-link">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;