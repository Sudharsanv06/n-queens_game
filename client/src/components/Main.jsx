// client/src/components/Main.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../auth.css';

const Main = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <h1 className="title">Welcome to the N-Queens Game</h1>
      <p className="subtitle">Solve the classic puzzle with modern UI</p>
      <div className="auth-buttons">
        <button onClick={() => navigate('/login')}>Login</button>
        <button onClick={() => navigate('/signup')}>Signup</button>
      </div>
    </div>
  );
};

export default Main;
