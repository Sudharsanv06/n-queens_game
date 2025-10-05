import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import './RegisteredGameModes.css';

const RegisteredGameModes = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState('');

  const gameModes = [
    {
      id: 'classic',
      name: 'Classic Mode',
      description: 'Traditional N-Queens puzzle with customizable board sizes',
      difficulty: 'Easy to Expert',
      icon: '♛',
      color: '#4CAF50',
      features: ['Custom board sizes', 'Step-by-step hints', 'Solution validation', 'Leaderboard tracking']
    },
    {
      id: 'time-trial',
      name: 'Time Trial',
      description: 'Race against the clock to solve puzzles quickly',
      difficulty: 'Medium to Hard',
      icon: '⏱️',
      color: '#FF9800',
      features: ['Timer countdown', 'Score multipliers', 'Global rankings', 'Speed bonuses']
    },
    {
      id: 'puzzle-mode',
      name: 'Puzzle Mode',
      description: 'Pre-designed challenging puzzles with unique solutions',
      difficulty: 'Hard',
      icon: '🧩',
      color: '#9C27B0',
      features: ['Unique puzzle sets', 'Achievement system', 'Daily challenges', 'Progressive difficulty']
    },
    {
      id: 'multiplayer',
      name: 'Multiplayer',
      description: 'Compete with friends in real-time puzzle solving',
      difficulty: 'All Levels',
      icon: '👥',
      color: '#2196F3',
      features: ['Real-time competition', 'Friend challenges', 'Tournaments', 'Live rankings']
    }
  ];

  const quickGames = [
    { 
      size: 4, 
      name: '4×4 Classic', 
      difficulty: 'Beginner', 
      time: '1 min',
      description: 'Perfect for beginners'
    },
    { 
      size: 6, 
      name: '6×6 Puzzle', 
      difficulty: 'Intermediate', 
      time: '3 min',
      description: 'Step up the challenge'
    },
    { 
      size: 8, 
      name: '8×8 Challenge', 
      difficulty: 'Advanced', 
      time: '5 min',
      description: 'Classic chess board'
    },
    { 
      size: 10, 
      name: '10×10 Expert', 
      difficulty: 'Master', 
      time: '10 min',
      description: 'Ultimate challenge'
    }
  ];

  const handleModeSelect = (mode) => {
    setSelectedMode(mode.id);
  };

  const handleQuickGame = (size) => {
    navigate(`/game/classic?size=${size}`);
  };

  const handleStartMode = () => {
    if (selectedMode) {
      // Navigate to dedicated mode pages for classic and time-trial
      switch (selectedMode) {
        case 'classic':
          navigate('/classic-mode');
          break;
        case 'time-trial':
          navigate('/time-trial-mode');
          break;
        case 'puzzle-mode':
          navigate(`/game/${selectedMode}?timeLimit=600`);
          break;
        case 'multiplayer':
          navigate(`/game/${selectedMode}?timeLimit=180`);
          break;
        default:
          navigate(`/game/${selectedMode}`);
      }
    }
  };

  return (
    <Layout>
      <div className="registered-game-modes">
        <div className="modes-container">
          <div className="modes-header">
            <h1>Choose Your Game Mode</h1>
            <p>Select a game mode or jump into a quick challenge</p>
          </div>

          {/* Quick Games Section */}
          <div className="quick-games-section">
            <h2>Quick Start Challenges</h2>
            <div className="quick-games-grid">
              {quickGames.map((game) => (
                <div
                  key={game.size}
                  className="quick-game-card"
                  onClick={() => handleQuickGame(game.size)}
                >
                  <div className="game-icon">
                    {game.size}×{game.size}
                  </div>
                  <div className="game-info">
                    <h3>{game.name}</h3>
                    <p className="game-description">{game.description}</p>
                    <div className="game-meta">
                      <span className="difficulty-badge">{game.difficulty}</span>
                      <span className="time-estimate">{game.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Game Modes Section */}
          <div className="game-modes-section">
            <h2>Game Modes</h2>
            <div className="modes-grid">
              {gameModes.map((mode) => (
                <div
                  key={mode.id}
                  className={`mode-card ${selectedMode === mode.id ? 'selected' : ''}`}
                  onClick={() => handleModeSelect(mode)}
                >
                  <div className="mode-header">
                    <div className="mode-icon" style={{ backgroundColor: mode.color }}>
                      {mode.icon}
                    </div>
                    <h3>{mode.name}</h3>
                  </div>
                  <div className="mode-content">
                    <p className="mode-description">{mode.description}</p>
                    <div className="mode-difficulty" style={{ backgroundColor: mode.color }}>
                      {mode.difficulty}
                    </div>
                    <ul className="mode-features">
                      {mode.features.map((feature, index) => (
                        <li key={index}>
                          <span className="feature-icon">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="modes-actions">
            <button
              className="start-mode-btn"
              onClick={handleStartMode}
              disabled={!selectedMode}
            >
              Start {selectedMode ? gameModes.find(m => m.id === selectedMode)?.name : 'Game Mode'}
            </button>
            <button
              className="back-btn"
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisteredGameModes;
