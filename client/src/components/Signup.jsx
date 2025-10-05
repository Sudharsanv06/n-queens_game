import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import { OfflineAuth } from '../utils/offlineAuth';
import Layout from './Layout';
import './Signup.css';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Signup = () => {
  const [form, setForm] = useState({ 
    name: '',
    email: '', 
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;  
    if (name === 'mobile') {
      const mobileValue = value.replace(/\D/g, '').slice(0, 10);
      setForm({ ...form, [name]: mobileValue });
    } else {
      setForm({ ...form, [name]: value });
    }    
    setError('');    
    if (name === 'password') {
      if (value.length < 6) {
        setPasswordStrength('weak');
      } else if (value.length < 10) {
        setPasswordStrength('medium');
      } else {
        setPasswordStrength('strong');
      }
    }
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      setError('Name is required');
      return false;
    }   
    if (!form.email.trim()) {
      setError('Email is required');
      return false;
    }   
    if (!/^\d{10}$/.test(form.mobile)) {
      setError('Mobile number must be exactly 10 digits');
      return false;
    }    
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }    
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }    
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }    
    setLoading(true);
    setError('');    
    try {
      let response;
      
      // Use offline authentication if on mobile or offline
      if (Capacitor.isNativePlatform() || !navigator.onLine) {
        response = await OfflineAuth.register(form);
        // The offline auth already handles localStorage storage
        // Just trigger a storage event to update other components
        window.dispatchEvent(new Event('storage'));
      } else {
        // Try online authentication first
        try {
          const axiosResponse = await axios.post(`${API_BASE_URL}/auth/signup`, {
            name: form.name,
            email: form.email,
            mobile: form.mobile,
            password: form.password
          });
          response = axiosResponse.data;
          
          // For online signup, don't store auth data since user needs to login
          console.log('Online signup successful:', response.message);
        } catch (networkError) {
          console.log('Network error, falling back to offline registration:', networkError.message);
          
          // Check if it's a validation error from server
          if (networkError.response && networkError.response.data && networkError.response.data.message) {
            throw new Error(networkError.response.data.message);
          }
          
          // Fall back to offline registration
          response = await OfflineAuth.register(form);
          window.dispatchEvent(new Event('storage'));
        }
      }
      
      console.log('Signup successful, user data:', response);
      
      // Show appropriate success message
      const successMessage = response.message || 'Account created successfully! Please log in to continue.';
      alert(successMessage);
      
      // Always redirect to login page after signup
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="signup-page">
        <div className="signup-container">
          <div className="signup-header">
            <h1>Create Account</h1>
            <p>Join the N-Queens community and start solving puzzles!</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <form onSubmit={handleSignup} className="signup-form">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
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
              <label htmlFor="mobile">Mobile Number * (10 digits)</label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                placeholder="Enter your 10-digit mobile number"
                value={form.mobile}
                onChange={handleChange}
                maxLength="10"
                pattern="[0-9]{10}"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                required
              />
              {form.password && (
                <div className={`password-strength ${passwordStrength}`}>
                  Password strength: {passwordStrength}
                </div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span>I agree to the Terms of Service and Privacy Policy</span>
              </label>
            </div>
            <button 
              type="submit" 
              className="signup-btn"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <div className="signup-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="login-link">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default Signup;