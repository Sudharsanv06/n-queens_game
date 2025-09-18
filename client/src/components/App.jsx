// client/src/components/App.jsx
import React, { useState, useEffect } from 'react';
import Board from './Board';
import '../styles.css';

const App = () => {
  const [size, setSize] = useState(8);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('user');
    if (storedEmail) {
      const name = storedEmail.split('@')[0];
      setUsername(name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/'; // redirect to main page
  };

  return (
    <div className="container">
      <div className="top-bar">
        <div className="profile">
          <img src="/profile-icon.png" alt="profile" className="profile-icon" />
          <span className="username">{username}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <h1>N Queens Game</h1>
      <input
        type="number"
        value={size}
        onChange={(e) => setSize(parseInt(e.target.value) || 1)}
        min="1"
      />
      <hr />
      <Board size={size} />
    </div>
  );
};

export default App;
