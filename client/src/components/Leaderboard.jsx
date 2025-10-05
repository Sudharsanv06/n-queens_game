import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Capacitor } from '@capacitor/core';
import { fetchLeaderboard } from '../store/slices/gameSlice';
import { OfflineGameStore } from '../utils/offlineStore';
import { OfflineAuth } from '../utils/offlineAuth';
import Layout from './Layout';
import './Leaderboard.css';
const Leaderboard = () => {
  const dispatch = useDispatch();
  const onlineLeaderboard = useSelector((state) => state.game.leaderboard);
  const loadingFromStore = useSelector((state) => state.game.loading.leaderboard);
  const [category, setCategory] = useState('all');
  const [leaderboard, setLeaderboard] = useState([]);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'classic', label: 'Classic (4x4)' },
    { value: 'modern', label: 'Modern (5x5-6x6)' },
    { value: 'adventure', label: 'Adventure (7x7-8x8)' },
    { value: 'expert', label: 'Expert (9x9-10x10)' }
  ];

  // Get offline leaderboard data with level completion tracking
  const getOfflineLeaderboard = () => {
    try {
      const allUsers = OfflineAuth.getOfflineUsers();
      const currentUser = OfflineAuth.getCurrentUser();
      const games = OfflineGameStore.getGames();
      
      // Create leaderboard from offline users
      const offlineLeaderboard = allUsers.map(user => {
        const userGames = games.filter(game => game.userId === user.id && game.solved);
        const stats = user.stats || {
          gamesPlayed: 0,
          gamesWon: 0,
          totalTime: 0,
          bestTimes: {},
          streak: 0
        };

        // Get completed levels for this specific user
        const userCompletions = JSON.parse(localStorage.getItem(`userCompletions_${user.id}`) || '{}');
        const completedLevels = Object.keys(userCompletions)
          .filter(key => key.startsWith('level_'))
          .map(key => parseInt(key.replace('level_', '')))
          .sort((a, b) => b - a);

        const levelsCompleted = completedLevels.length;
        const highestLevel = levelsCompleted > 0 ? Math.max(...completedLevels) : 0;

        // Calculate scores based on both games and level completions
        const gameScores = userGames.map(game => {
          // If the game already has a calculated score, use it
          if (game.score && game.score > 0) {
            return game.score;
          }
          
          // Otherwise calculate score (for backward compatibility)
          let score = 1000; // Base score
          if (game.timeElapsed) {
            score += Math.max(0, 500 - game.timeElapsed * 2); // Speed bonus
          }
          if (game.moves) {
            score -= game.moves * 10; // Move penalty
          }
          if (game.hints) {
            score -= game.hints * 100; // Hint penalty
          }
          score += (game.boardSize || 4) * 50; // Difficulty bonus
          return Math.max(100, score); // Minimum score
        });

        // Add level completion bonus scores from user-specific data
        const levelBonusScore = completedLevels.reduce((total, level) => {
          const levelData = userCompletions[`level_${level}`];
          const levelPoints = levelData ? levelData.points : ([100, 120, 150, 180, 220, 250, 280, 300, 350, 500][level - 1] || 500);
          return total + levelPoints;
        }, 0);

        const totalScore = gameScores.reduce((a, b) => a + b, 0) + levelBonusScore;
        const bestScore = Math.max(...gameScores, levelBonusScore || 0);
        const avgScore = gameScores.length > 0 ? gameScores.reduce((a, b) => a + b, 0) / gameScores.length : 0;
        const avgTime = stats.gamesWon > 0 ? stats.totalTime / stats.gamesWon : 0;

        // Get user's rank based on completed levels
        const getUserRank = () => {
          if (highestLevel >= 10) return { rank: 'Crown Master', icon: '👑', color: '#9B59B6' };
          if (highestLevel >= 8) return { rank: 'Diamond Elite', icon: '💎', color: '#B9F2FF' };
          if (highestLevel >= 6) return { rank: 'Gold Master', icon: '🥇', color: '#FFD700' };
          if (highestLevel >= 4) return { rank: 'Silver Elite', icon: '🥈', color: '#C0C0C0' };
          if (highestLevel >= 2) return { rank: 'Bronze Elite', icon: '🥉', color: '#CD7F32' };
          return { rank: 'Rookie', icon: '🌟', color: '#4CAF50' };
        };

        const rank = getUserRank();

        return {
          _id: user.id,
          username: user.name,
          bestScore: Math.round(bestScore),
          avgScore: Math.round(avgScore),
          totalScore: Math.round(totalScore),
          totalGames: stats.gamesWon,
          levelsCompleted,
          highestLevel,
          rank: rank.rank,
          rankIcon: rank.icon,
          rankColor: rank.color,
          avgTime: Math.round(avgTime),
          isCurrentUser: currentUser && currentUser.id === user.id
        };
      }).filter(user => user.totalGames > 0 || user.levelsCompleted > 0); // Users who have played or completed levels

      // Sort by total score (games + level bonuses)
      return offlineLeaderboard.sort((a, b) => b.totalScore - a.totalScore);
    } catch (error) {
      console.error('Error getting offline leaderboard:', error);
      return [];
    }
  };

  // Refresh leaderboard data
  const refreshLeaderboard = () => {
    const offlineData = getOfflineLeaderboard();
    setLeaderboard(offlineData);
  };

  useEffect(() => {
    // Check if we're in offline mode (always true for now since we're using offline system)
    const offline = true; // Capacitor.isNativePlatform() || !navigator.onLine;
    setIsOfflineMode(offline);

    const loadLeaderboard = () => {
      if (offline) {
        // Use offline data
        const offlineData = getOfflineLeaderboard();
        setLeaderboard(offlineData);
      } else {
        // Trigger Redux thunk to fetch leaderboard from API
        if (category === 'all') {
          dispatch(fetchLeaderboard());
        } else {
          dispatch(fetchLeaderboard(category));
        }
        setLeaderboard(onlineLeaderboard);
      }
    };

    loadLeaderboard();

    // Listen for level completions and regular game completions to refresh leaderboard
    const handleLevelCompleted = () => {
      console.log('Level completed - refreshing leaderboard');
      setTimeout(() => loadLeaderboard(), 500); // Small delay to ensure data is saved
    };

    const handleGameCompleted = () => {
      console.log('Game completed - refreshing leaderboard');
      setTimeout(() => loadLeaderboard(), 500); // Small delay to ensure data is saved
    };

    window.addEventListener('levelCompleted', handleLevelCompleted);
    window.addEventListener('gameCompleted', handleGameCompleted);

    return () => {
      window.removeEventListener('levelCompleted', handleLevelCompleted);
      window.removeEventListener('gameCompleted', handleGameCompleted);
    };
  }, [category, onlineLeaderboard, dispatch]);

  const loading = loadingFromStore;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout>
      <div className="leaderboard-page">
        <div className="hero-section">
          <div className="hero-content">
            <h1>🏆 Leaderboard</h1>
            <p className="hero-subtitle">Top N-Queens Players</p>
          </div>
        </div>
        
        <div className="leaderboard-container">
          <div className="leaderboard-header">
            {isOfflineMode && (
              <div className="offline-indicator" style={{
                backgroundColor: 'rgba(130, 150, 111, 0.1)',
                border: '1px solid #82966f',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>📱 <strong>Level-Based Rankings:</strong> Showing progress from all completed levels</span>
                <button 
                  onClick={refreshLeaderboard}
                  style={{
                    background: '#82966f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  🔄 Refresh
                </button>
              </div>
            )}
            
            <div className="category-selector">
              <label htmlFor="category">Select Category:</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isOfflineMode} // Disable in offline mode for now
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading leaderboard...</p>
            </div>
          ) : (
            <div className="leaderboard-content">
              {leaderboard.length === 0 ? (
                <div className="no-data">
                  <div className="no-data-icon">�</div>
                  <h3>Complete Levels to Join the Leaderboard!</h3>
                  <p>🎮 Solve level challenges in the Home page to appear here</p>
                  <p>🥉 Bronze → 🥈 Silver → 🥇 Gold → 💎 Diamond → 👑 Crown</p>
                  <button 
                    onClick={() => window.location.href = '/'}
                    style={{
                      background: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      cursor: 'pointer',
                      marginTop: '16px',
                      fontSize: '1rem'
                    }}
                  >
                    Start Playing Levels
                  </button>
                </div>
              ) : (
                <div className="leaderboard-table">
                  <div className="table-header">
                    <div className="rank">Rank</div>
                    <div className="player">Player</div>
                    <div className="best-score">Total Score</div>
                    <div className="avg-score">Levels</div>
                    <div className="games">Games</div>
                    <div className="avg-time">Rank</div>
                  </div>
                  
                  {leaderboard.map((player, index) => (
                    <div key={player._id} className={`table-row ${index < 3 ? `top-player rank-${index + 1}` : ''} ${player.isCurrentUser ? 'current-user' : ''}`}>
                      <div className="rank">
                        <div className="rank-badge">
                          {index === 0 && <span className="medal gold">🥇</span>}
                          {index === 1 && <span className="medal silver">🥈</span>}
                          {index === 2 && <span className="medal bronze">🥉</span>}
                          {index >= 3 && <span className="rank-number">#{index + 1}</span>}
                        </div>
                      </div>
                      <div className="player">
                        <div className="player-info">
                          <div className="player-avatar">
                            {player.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="player-name">
                            {player.username}
                            {player.isCurrentUser && <span style={{ color: '#82966f', marginLeft: '5px' }}>(You)</span>}
                          </span>
                        </div>
                      </div>
                      <div className="best-score">
                        <span className="score-value">{Math.round(player.totalScore || player.bestScore)}</span>
                        <span className="score-label">pts</span>
                      </div>
                      <div className="avg-score">
                        <span className="score-value">{player.levelsCompleted || 0}</span>
                        <span className="score-label">/ 10</span>
                      </div>
                      <div className="games">
                        <span className="games-count">{player.totalGames}</span>
                      </div>
                      <div className="avg-time">
                        <div className="rank-info" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ color: player.rankColor || '#4CAF50' }}>{player.rankIcon || '🌟'}</span>
                          <span className="rank-name" style={{ 
                            fontSize: '0.8rem', 
                            color: player.rankColor || '#4CAF50',
                            fontWeight: 'bold'
                          }}>
                            {player.rank || 'Rookie'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="scoring-section">
            <div className="section-container">
              <h2>How Scoring Works</h2>
              <p className="scoring-subtitle">Understanding the competitive ranking system</p>
              
              <div className="scoring-grid">
                <div className="score-card">
                  <div className="score-icon">🎯</div>
                  <h3>Base Score</h3>
                  <p className="score-points">1000 points</p>
                  <p className="score-desc">For successfully solving the puzzle</p>
                </div>
                
                <div className="score-card">
                  <div className="score-icon">🏆</div>
                  <h3>Level Completion</h3>
                  <p className="score-points">100-500 pts</p>
                  <p className="score-desc">Bonus points for completing level challenges</p>
                </div>
                
                <div className="score-card">
                  <div className="score-icon">⚡</div>
                  <h3>Speed Bonus</h3>
                  <p className="score-points">Up to +500 pts</p>
                  <p className="score-desc">Faster solutions earn more points</p>
                </div>
                
                <div className="score-card">
                  <div className="score-icon">🎲</div>
                  <h3>Move Efficiency</h3>
                  <p className="score-points">-10 pts per move</p>
                  <p className="score-desc">Fewer moves = higher score</p>
                </div>
                
                <div className="score-card">
                  <div className="score-icon">�</div>
                  <h3>Hint Penalty</h3>
                  <p className="score-points">-100 pts per hint</p>
                  <p className="score-desc">Independent solving rewarded</p>
                </div>
                
                <div className="score-card">
                  <div className="score-icon">👑</div>
                  <h3>Rank System</h3>
                  <p className="score-points">Bronze → Crown</p>
                  <p className="score-desc">Progress through 5 difficulty tiers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Leaderboard;