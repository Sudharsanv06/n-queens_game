import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import './GameModeSelection.css';

const GameModeSelection = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState('');

  const gameModes = [
    {
      id: '4x4',
      name: '4×4 Board',
      description: 'Perfect for beginners',
      difficulty: 'Beginner',
      time: '1-2 minutes',
      size: 4,
      color: '#4CAF50'
    },
    {
      id: '6x6',
      name: '6×6 Board',
      description: 'Step up the challenge',
      difficulty: 'Intermediate',
      time: '3-5 minutes',
      size: 6,
      color: '#FF9800'
    },
    {
      id: '8x8',
      name: '8×8 Board',
      description: 'Classic chess board',
      difficulty: 'Advanced',
      time: '5-10 minutes',
      size: 8,
      color: '#2196F3'
    },
    {
      id: '10x10',
      name: '10×10 Board',
      description: 'Ultimate challenge',
      difficulty: 'Expert',
      time: '10-15 minutes',
      size: 10,
      color: '#9C27B0'
    }
  ];

  const handleModeSelect = (mode) => {
    setSelectedMode(mode.id);
  };

  const handleStartGame = () => {
    if (selectedMode) {
      const mode = gameModes.find(m => m.id === selectedMode);
      navigate(`/game/free-trial?size=${mode.size}`);
    }
  };

  return (
    <Layout>
      <div className="game-mode-selection">
        <div className="selection-container">
          <div className="selection-header">
            <h1>Choose Your Challenge</h1>
            <p>Select a board size to start your free trial game</p>
          </div>

          <div className="modes-grid">
            {gameModes.map((mode) => (
              <div
                key={mode.id}
                className={`mode-card ${selectedMode === mode.id ? 'selected' : ''}`}
                onClick={() => handleModeSelect(mode)}
              >
                <div className="mode-icon" style={{ backgroundColor: mode.color }}>
                  {mode.size}×{mode.size}
                </div>
                <div className="mode-info">
                  <h3>{mode.name}</h3>
                  <p className="mode-description">{mode.description}</p>
                  <div className="mode-details">
                    <span className="difficulty" style={{ backgroundColor: mode.color }}>
                      {mode.difficulty}
                    </span>
                    <span className="time-estimate">{mode.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="selection-actions">
            <button
              className="start-game-btn"
              onClick={handleStartGame}
              disabled={!selectedMode}
            >
              Start Free Trial Game
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

export default GameModeSelection;
