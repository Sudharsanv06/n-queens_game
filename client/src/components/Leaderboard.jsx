import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeaderboard } from '../store/slices/gameSlice';
import Layout from './Layout';
import './Leaderboard.css';
const Leaderboard = () => {
  const dispatch = useDispatch();
  const leaderboard = useSelector((state) => state.game.leaderboard);
  const loadingFromStore = useSelector((state) => state.game.loading.leaderboard);
  const [category, setCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'classic', label: 'Classic (4x4)' },
    { value: 'modern', label: 'Modern (5x5-6x6)' },
    { value: 'adventure', label: 'Adventure (7x7-8x8)' },
    { value: 'expert', label: 'Expert (9x9-10x10)' }
  ];

  useEffect(() => {
    // Trigger Redux thunk to fetch leaderboard from API
    if (category === 'all') {
      dispatch(fetchLeaderboard());
    } else {
      dispatch(fetchLeaderboard(category));
    }
  }, [category]);

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
            
            <div className="category-selector">
              <label htmlFor="category">Select Category:</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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
                  <div className="no-data-icon">🎯</div>
                  <h3>No data available</h3>
                  <p>Be the first to solve puzzles in this category!</p>
                </div>
              ) : (
                <div className="leaderboard-table">
                  <div className="table-header">
                    <div className="rank">Rank</div>
                    <div className="player">Player</div>
                    <div className="best-score">Best Score</div>
                    <div className="avg-score">Avg Score</div>
                    <div className="games">Games</div>
                    <div className="avg-time">Avg Time</div>
                  </div>
                  
                  {leaderboard.map((player, index) => (
                    <div key={player._id} className={`table-row ${index < 3 ? `top-player rank-${index + 1}` : ''}`}>
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
                          <span className="player-name">{player.username}</span>
                        </div>
                      </div>
                      <div className="best-score">
                        <span className="score-value">{Math.round(player.bestScore)}</span>
                        <span className="score-label">pts</span>
                      </div>
                      <div className="avg-score">
                        <span className="score-value">{Math.round(player.avgScore)}</span>
                        <span className="score-label">avg</span>
                      </div>
                      <div className="games">
                        <span className="games-count">{player.totalGames}</span>
                      </div>
                      <div className="avg-time">
                        <span className="time-value">{formatTime(Math.round(player.avgTime))}</span>
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
                  <div className="score-icon">💡</div>
                  <h3>Hint Penalty</h3>
                  <p className="score-points">-100 pts per hint</p>
                  <p className="score-desc">Independent solving rewarded</p>
                </div>
                
                <div className="score-card">
                  <div className="score-icon">📈</div>
                  <h3>Difficulty Bonus</h3>
                  <p className="score-points">+50 pts per level</p>
                  <p className="score-desc">Larger boards give more points</p>
                </div>
                
                <div className="score-card">
                  <div className="score-icon">🏆</div>
                  <h3>Consistency</h3>
                  <p className="score-points">Average matters</p>
                  <p className="score-desc">Regular high scores boost ranking</p>
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