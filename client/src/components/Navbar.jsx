import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { OfflineAuth } from '../utils/offlineAuth';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Check user status on load and when storage changes
  useEffect(() => {
    const checkUser = () => {
      // Use OfflineAuth to get current user consistently
      const userData = OfflineAuth.getCurrentUser();
      setUser(userData);
    };

    // Initial check
    checkUser();

    // Listen for storage events (for cross-tab sync)
    const handleStorageChange = () => checkUser();
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    // Use OfflineAuth logout method for consistency
    OfflineAuth.logout();
    setUser(null);
    // Notify other tabs
    window.dispatchEvent(new Event('storage'));
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo">
            N-Queens Game
          </Link>
        </div>
        
        <div className="navbar-menu">
          <Link 
            to="/" 
            className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className={`navbar-link ${location.pathname === '/about' ? 'active' : ''}`}
          >
            About
          </Link>
          <Link 
            to="/leaderboard" 
            className={`navbar-link ${location.pathname === '/leaderboard' ? 'active' : ''}`}
          >
            Leaderboard
          </Link>
          <Link 
            to="/tutorial" 
            className={`navbar-link ${location.pathname === '/tutorial' ? 'active' : ''}`}
          >
            Tutorial
          </Link>
          <Link 
            to="/contact" 
            className={`navbar-link ${location.pathname === '/contact' ? 'active' : ''}`}
          >
            Contact
          </Link>
        </div>
        
        <div className="navbar-auth">
          {user ? (
            <div className="user-section">
              <span className="username">Welcome, {user.name}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="navbar-btn login-btn">
                Login
              </Link>
              <Link to="/signup" className="navbar-btn signup-btn">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;