import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from './Layout';
import './GameBoard.css';

const GameBoard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const size = parseInt(searchParams.get('size')) || 8;
  const mode = searchParams.get('mode') || 'free-trial';
  const timeLimit = parseInt(searchParams.get('timeLimit')) || null; // in seconds
  
  const [board, setBoard] = useState([]);
  const [queens, setQueens] = useState([]);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [gameEndTime, setGameEndTime] = useState(null);
  const [moves, setMoves] = useState(0);
  const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
  const [showResult, setShowResult] = useState(false);
  const [isFreeTrial, setIsFreeTrial] = useState(false);
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  // Check user login status
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      setIsFreeTrial(false);
    } else {
      setIsFreeTrial(mode === 'free-trial');
    }
  }, [mode]);

  // Initialize board
  useEffect(() => {
    const newBoard = Array(size).fill(null).map(() => Array(size).fill(null));
    setBoard(newBoard);
    setQueens([]);
    setMoves(0);
    setGameStartTime(Date.now());
    setGameEndTime(null);
    setGameStatus('playing');
    setShowResult(false);
    setTimeLeft(timeLimit);
  }, [size, mode, timeLimit]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLimit && timeLeft > 0 && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLimit && timeLeft === 0 && gameStatus === 'playing') {
      // Time's up
      setGameEndTime(Date.now());
      setGameStatus('lost');
      setShowResult(true);
    }
  }, [timeLeft, timeLimit, gameStatus]);

  // Check if position is safe for queen
  const isSafe = useCallback((row, col, queens) => {
    for (const queen of queens) {
      // Same row, column, or diagonal
      if (queen.row === row || 
          queen.col === col || 
          Math.abs(queen.row - row) === Math.abs(queen.col - col)) {
        return false;
      }
    }
    return true;
  }, []);

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (gameStatus !== 'playing') return;

    const newMoves = moves + 1;
    setMoves(newMoves);

    // Check if there's already a queen at this position
    const existingQueenIndex = queens.findIndex(q => q.row === row && q.col === col);
    
    if (existingQueenIndex !== -1) {
      // Remove queen
      const newQueens = queens.filter((_, index) => index !== existingQueenIndex);
      setQueens(newQueens);
    } else {
      // Add queen if position is safe
      if (isSafe(row, col, queens)) {
        const newQueens = [...queens, { row, col }];
        setQueens(newQueens);
        
        // Check if game is won
        if (newQueens.length === size) {
          setGameEndTime(Date.now());
          setGameStatus('won');
          calculatePoints();
          
          // Mark daily challenge as completed if it's a daily challenge
          if (mode === 'daily') {
            const day = searchParams.get('day');
            if (day) {
              const completed = JSON.parse(localStorage.getItem('completedChallenges') || '{}');
              completed[day] = new Date().toISOString();
              localStorage.setItem('completedChallenges', JSON.stringify(completed));
            }
          }
          
          setShowResult(true);
        }
      } else {
        // Invalid move - show error or handle as needed
        console.log('Invalid move! Queen would be in danger.');
      }
    }
  };

  // Calculate points based on game performance
  const calculatePoints = () => {
    const gameTime = getGameTime();
    let baseScore = 1000; // Base score for completing
    let speedBonus = 0;
    let movePenalty = moves * 10; // Penalty for each move
    let difficultyBonus = size * 50; // Bonus for larger boards
    
    // Speed bonus (faster = more points)
    if (timeLimit) {
      const timeUsed = timeLimit - timeLeft;
      speedBonus = Math.max(0, (timeLimit - timeUsed) * 5);
    } else {
      // For games without time limit, bonus for being fast
      speedBonus = Math.max(0, (300 - gameTime) * 2); // 5 minutes = 300 seconds
    }
    
    const totalPoints = Math.max(0, baseScore + speedBonus + difficultyBonus - movePenalty);
    setPoints(totalPoints);
  };

  // Calculate game time
  const getGameTime = () => {
    if (!gameStartTime) return 0;
    const endTime = gameEndTime || Date.now();
    return Math.floor((endTime - gameStartTime) / 1000);
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current time display (countdown or elapsed)
  const getCurrentTimeDisplay = () => {
    if (timeLimit && gameStatus === 'playing') {
      return formatTime(timeLeft);
    } else {
      return formatTime(getGameTime());
    }
  };

  // Handle play again
  const handlePlayAgain = () => {
    if (isFreeTrial) {
      navigate('/signup');
    } else {
      // For registered users, go back to game modes
      navigate('/registered-game-modes');
    }
  };

  // Handle back to home
  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <Layout>
      <div className="game-board-page">
        <div className="game-container">
          <div className="game-header">
            <h1>N-Queens Game</h1>
            <div className="game-info">
              <div className="info-item">
                <span className="label">Board Size:</span>
                <span className="value">{size}×{size}</span>
              </div>
              <div className="info-item">
                <span className="label">Time:</span>
                <span className="value">{getCurrentTimeDisplay()}</span>
              </div>
              <div className="info-item">
                <span className="label">Moves:</span>
                <span className="value">{moves}</span>
              </div>
              <div className="info-item">
                <span className="label">Queens:</span>
                <span className="value">{queens.length}/{size}</span>
              </div>
            </div>
          </div>

          <div className="board-container">
            <div 
              className="chess-board"
              style={{
                gridTemplateColumns: `repeat(${size}, 1fr)`,
                gridTemplateRows: `repeat(${size}, 1fr)`
              }}
            >
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const hasQueen = queens.some(q => q.row === rowIndex && q.col === colIndex);
                  const isLight = (rowIndex + colIndex) % 2 === 0;
                  
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`chess-square ${isLight ? 'light' : 'dark'} ${hasQueen ? 'has-queen' : ''}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {hasQueen && <span className="queen">♛</span>}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="game-instructions">
            <p>Click on squares to place queens. Queens cannot attack each other.</p>
            <p>Place {size} queens to win!</p>
          </div>

          {showResult && (
            <div className="game-result-overlay">
              <div className="result-modal">
                <div className="result-header">
                  <h2>{gameStatus === 'won' ? '🎉 Congratulations!' : 'Game Over'}</h2>
                </div>
                <div className="result-stats">
                  <div className="stat">
                    <span className="stat-label">Time:</span>
                    <span className="stat-value">{formatTime(getGameTime())}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Moves:</span>
                    <span className="stat-value">{moves}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Board Size:</span>
                    <span className="stat-value">{size}×{size}</span>
                  </div>
                  {points > 0 && (
                    <div className="stat">
                      <span className="stat-label">Points:</span>
                      <span className="stat-value">{points}</span>
                    </div>
                  )}
                </div>
                <div className="result-actions">
                  <button className="play-again-btn" onClick={handlePlayAgain}>
                    {isFreeTrial ? 'Sign Up to Play More' : 'Play Again'}
                  </button>
                  <button className="home-btn" onClick={handleBackToHome}>
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default GameBoard;
