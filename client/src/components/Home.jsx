import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { fetchDailyChallenge } from '../store/slices/gameSlice';
import Layout from "./Layout";
import './Home.css';

const Home = () => {
  const [user, setUser] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dailyChallenge = useSelector((state) => state.game.dailyChallenge);

  // Check and update user state
  const checkUserStatus = () => {
    const userData = localStorage.getItem('user');
    setUser(userData ? JSON.parse(userData) : null);
  };

  useEffect(() => {
    // Initial check
    checkUserStatus();

    // Load completed challenges from localStorage
    const completed = localStorage.getItem('completedChallenges');
    if (completed) {
      setCompletedChallenges(JSON.parse(completed));
    }

    // Set up event listeners
    const handleStorageChange = () => checkUserStatus();
    const handleCustomLogout = () => checkUserStatus();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('customLogout', handleCustomLogout);

    // Fetch today's daily challenge from API if authenticated
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(fetchDailyChallenge());
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customLogout', handleCustomLogout);
    };
  }, []);

  // Check if a challenge is available (24 hours cooldown)
  const isChallengeAvailable = (day) => {
    const lastCompleted = completedChallenges[day];
    if (!lastCompleted) return true;
    
    const now = new Date();
    const lastCompletedDate = new Date(lastCompleted);
    const hoursDiff = (now - lastCompletedDate) / (1000 * 60 * 60);
    
    return hoursDiff >= 24;
  };

  // Get time until next challenge is available
  const getTimeUntilAvailable = (day) => {
    const lastCompleted = completedChallenges[day];
    if (!lastCompleted) return null;
    
    const now = new Date();
    const lastCompletedDate = new Date(lastCompleted);
    const nextAvailable = new Date(lastCompletedDate.getTime() + 24 * 60 * 60 * 1000);
    const timeDiff = nextAvailable - now;
    
    if (timeDiff <= 0) return null;
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const gameModes = [
    {
      id: 'classic',
      name: 'Classic Mode',
      description: 'Traditional N-Queens puzzle with customizable board sizes from 4x4 to 10x10',
      difficulty: 'Easy to Expert',
      icon: '♛',
      color: '#4CAF50',
      bgColor: '#E8F5E8',
      features: ['Custom board sizes', 'Step-by-step hints', 'Solution validation', 'Leaderboard tracking'],
      backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      className: 'classic'
    },
    {
      id: 'time-trial',
      name: 'Time Trial',
      description: 'Race against the clock to solve puzzles quickly and climb the leaderboard',
      difficulty: 'Medium to Hard',
      icon: '⏱️',
      color: '#FF9800',
      bgColor: '#FFF3E0',
      features: ['Timer countdown', 'Score multipliers', 'Global rankings', 'Speed bonuses'],
      backgroundImage: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      className: 'time-trial'
    },
    {
      id: 'puzzle-mode',
      name: 'Puzzle Mode',
      description: 'Pre-designed challenging puzzles with unique solutions and special constraints',
      difficulty: 'Hard',
      icon: '🧩',
      color: '#9C27B0',
      bgColor: '#F3E5F5',
      features: ['Unique puzzle sets', 'Achievement system', 'Daily challenges', 'Progressive difficulty'],
      backgroundImage: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      className: 'puzzle-mode'
    },
    {
      id: 'multiplayer',
      name: 'Multiplayer',
      description: 'Compete with friends in real-time puzzle solving battles',
      difficulty: 'All Levels',
      icon: '👥',
      color: '#2196F3',
      bgColor: '#E3F2FD',
      features: ['Real-time competition', 'Friend challenges', 'Tournaments', 'Live rankings'],
      backgroundImage: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      className: 'multiplayer'
    }
  ];

  const quickGames = [
    { 
      size: 4, 
      name: '4×4 Classic', 
      difficulty: 'Beginner', 
      time: '1 min', 
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: 'Perfect for beginners',
      className: 'size-4'
    },
    { 
      size: 6, 
      name: '6×6 Puzzle', 
      difficulty: 'Intermediate', 
      time: '3 min', 
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      description: 'Step up the challenge',
      className: 'size-6'
    },
    { 
      size: 8, 
      name: '8×8 Challenge', 
      difficulty: 'Advanced', 
      time: '5 min', 
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      description: 'Classic chess board',
      className: 'size-8'
    },
    { 
      size: 10, 
      name: '10×10 Expert', 
      difficulty: 'Master', 
      time: '10 min', 
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      description: 'Ultimate challenge',
      className: 'size-10'
    }
  ];

  const dailyChallenges = [
    { 
      day: 'Monday', 
      size: 4, 
      difficulty: 'Beginner', 
      points: 100,
      icon: '🌟',
      color: '#4CAF50',
      description: 'Start your week strong'
    },
    { 
      day: 'Tuesday', 
      size: 5, 
      difficulty: 'Beginner', 
      points: 120,
      icon: '🔥',
      color: '#4CAF50',
      description: 'Keep the momentum going'
    },
    { 
      day: 'Wednesday', 
      size: 6, 
      difficulty: 'Intermediate', 
      points: 150,
      icon: '⚡',
      color: '#FF9800',
      description: 'Midweek challenge'
    },
    { 
      day: 'Thursday', 
      size: 7, 
      difficulty: 'Intermediate', 
      points: 180,
      icon: '🎯',
      color: '#FF9800',
      description: 'Push your limits'
    },
    { 
      day: 'Friday', 
      size: 8, 
      difficulty: 'Hard', 
      points: 220,
      icon: '💎',
      color: '#9C27B0',
      description: 'Friday challenge'
    },
    { 
      day: 'Saturday', 
      size: 9, 
      difficulty: 'Hard', 
      points: 250,
      icon: '🏆',
      color: '#9C27B0',
      description: 'Weekend warrior'
    },
    { 
      day: 'Sunday', 
      size: 10, 
      difficulty: 'Expert', 
      points: 300,
      icon: '👑',
      color: '#F44336',
      description: 'Ultimate Sunday test'
    }
  ];

  const stats = [
    { 
      value: '10,000+', 
      label: 'Daily Players', 
      icon: '👥'
    },
    { 
      value: '500,000+', 
      label: 'Puzzles Solved', 
      icon: '✅'
    },
    { 
      value: '50+', 
      label: 'Countries', 
      icon: '🌎'
    },
    { 
      value: '24/7', 
      label: 'Availability', 
      icon: '⏰'
    }
  ];

  return (
    <Layout>
      <div className="home-page">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="title-icon">♛</span>
              N-Queens Challenge
            </h1>
            <p className="hero-subtitle">
              Master the legendary chess puzzle! Strategically place queens on the board
              without them threatening each other. Test your logic and problem-solving skills
              with this timeless mathematical challenge.
            </p>
            
            {user ? (
              <div className="welcome-banner">
                <p>Welcome back, <strong>{user.name}</strong>! Ready for today's challenge?</p>
                <div className="hero-actions">
                  <Link to="/registered-game-modes" className="hero-btn primary">Play Games</Link>
                  <Link to="/leaderboard" className="hero-btn secondary">View Leaderboard</Link>
                </div>
              </div>
            ) : (
              <div className="hero-actions">
                <Link to="/game-mode-selection" className="hero-btn primary">Start Free Trial</Link>
                <Link to="/signup" className="hero-btn secondary">Sign Up to Play</Link>
                <Link to="/login" className="hero-btn secondary">Login</Link>
              </div>
            )}
          </div>
          
          <div className="hero-visual">
            <div className="chess-animation">
              <div className="chess-board">
                {[...Array(8)].map((_, row) => (
                  [...Array(8)].map((_, col) => (
                    <div 
                      key={`${row}-${col}`} 
                      className={`chess-square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`}
                    >
                      {(row === 0 && col === 0) || 
                       (row === 1 && col === 2) || 
                       (row === 2 && col === 5) || 
                       (row === 3 && col === 7) || 
                       (row === 4 && col === 1) || 
                       (row === 5 && col === 3) || 
                       (row === 6 && col === 6) || 
                       (row === 7 && col === 4) ? '♛' : ''}
                    </div>
                  ))
                ))}
              </div>
              <div className="chess-solution-label">Sample 8-Queens Solution</div>
            </div>
          </div>
        </section>

        {user && (
          <section className="daily-challenges-section">
            <div className="section-container">
              <h2>Daily Challenges</h2>
              <p className="section-subtitle">
                Complete weekly challenges with progressive difficulty levels
              </p>
              
              <div className="daily-challenges-grid">
                {dailyChallenges.map((challenge, index) => {
                  const isAvailable = isChallengeAvailable(challenge.day);
                  const timeUntilAvailable = getTimeUntilAvailable(challenge.day);
                  
                  return (
                    <div 
                      key={challenge.day} 
                      className={`daily-challenge-card ${!isAvailable ? 'disabled' : ''}`}
                    >
                      {isAvailable ? (
                        <Link 
                          to={`/game/daily?day=${challenge.day.toLowerCase()}&size=${challenge.size}`} 
                          className="challenge-link"
                        >
                          <div className="challenge-header">
                            <div className="challenge-icon" style={{ color: challenge.color }}>
                              {challenge.icon}
                            </div>
                            <div className="challenge-day">{challenge.day}</div>
                          </div>
                          <div className="challenge-content">
                            <div className="challenge-size">{challenge.size}×{challenge.size}</div>
                            <div className="challenge-difficulty" style={{ backgroundColor: challenge.color }}>
                              {challenge.difficulty}
                            </div>
                            <div className="challenge-description">{challenge.description}</div>
                            <div className="challenge-points">+{challenge.points} pts</div>
                          </div>
                        </Link>
                      ) : (
                        <div className="challenge-disabled">
                          <div className="challenge-header disabled">
                            <div className="challenge-icon" style={{ color: '#ccc' }}>
                              {challenge.icon}
                            </div>
                            <div className="challenge-day">{challenge.day}</div>
                          </div>
                          <div className="challenge-content">
                            <div className="challenge-size">{challenge.size}×{challenge.size}</div>
                            <div className="challenge-difficulty" style={{ backgroundColor: '#ccc' }}>
                              {challenge.difficulty}
                            </div>
                            <div className="challenge-description">Completed</div>
                            <div className="challenge-cooldown">
                              Available in: {timeUntilAvailable}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {user && (
          <section className="quick-games-section">
            <div className="section-container">
              <h2>Quick Start Challenges</h2>
              <p className="section-subtitle">
                Jump right into curated puzzles
              </p>
              
              <div className="quick-games-grid">
                {quickGames.map((game) => (
                  <Link 
                    key={game.size} 
                    to={`/game/classic?size=${game.size}`} 
                    className="quick-game-card"
                  >
                    <div className={`game-image-container ${game.className}`}>
                      <div className="game-overlay">
                        <div className="game-size">{game.size}×{game.size}</div>
                        <div className="game-description">{game.description}</div>
                      </div>
                    </div>
                    <div className="game-info">
                      <h3>{game.name}</h3>
                      <div className="game-meta">
                        <span className="difficulty-badge">
                          {game.difficulty}
                        </span>
                        <span className="time-estimate">{game.time}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {user && (
          <section className="game-modes-section">
            <div className="section-container">
              <h2>Explore Game Modes</h2>
              <p className="section-subtitle">Different ways to challenge your strategic thinking</p>
              
              <div className="game-modes-grid">
                {gameModes.map((mode) => (
                  <div key={mode.id} className="game-mode-card">
                    <div className={`mode-image-container ${mode.className}`}>
                      <div className="mode-overlay"></div>
                      <div className="mode-icon">{mode.icon}</div>
                      <h3 className="mode-title">{mode.name}</h3>
                    </div>
                    <div className="mode-content">
                      <p className="mode-description">{mode.description}</p>
                      <div className="mode-details">
                        <span className="difficulty">
                          {mode.difficulty}
                        </span>
                      </div>
                      <ul className="mode-features">
                        {mode.features.map((feature, index) => (
                          <li key={index}>
                            <span className="feature-icon">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Link 
                        to={`/game/${mode.id}`} 
                        className="play-mode-btn"
                      >
                        Play {mode.name.split(' ')[0]}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="stats-section">
          <div className="section-container">
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-number">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="enhanced-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h3>N-Queens Challenge</h3>
              <p>Master the legendary chess puzzle with our modern, interactive platform.</p>
              <div className="social-links">
                <a href="#" className="social-link">📘</a>
                <a href="#" className="social-link">🐦</a>
                <a href="#" className="social-link">📷</a>
                <a href="#" className="social-link">💼</a>
              </div>
            </div>
            
            <div className="footer-section">
              <h4>Game Modes</h4>
              <ul>
                <li><Link to="/game/classic">Classic Mode</Link></li>
                <li><Link to="/game/time-trial">Time Trial</Link></li>
                <li><Link to="/game/puzzle-mode">Puzzle Mode</Link></li>
                <li><Link to="/game/multiplayer">Multiplayer</Link></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Resources</h4>
              <ul>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/tutorial">Tutorial</Link></li>
                <li><Link to="/leaderboard">Leaderboard</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-divider"></div>
            <p>&copy; 2025 N-Queens Challenge. All rights reserved. Built with ❤️ for puzzle enthusiasts.</p>
          </div>
        </footer>
      </div>
    </Layout>
  );
};

export default Home;