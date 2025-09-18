import React, { useState, useEffect } from 'react';
import Cell from './Cell';
import axios from 'axios';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import './Board.css';

const Board = () => {
  const { mode = 'classic' } = useParams();
  const [searchParams] = useSearchParams();
  const [size, setSize] = useState(parseInt(searchParams.get('size')) || 8);
  const [queens, setQueens] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [user, setUser] = useState(null);
  const [gameStats, setGameStats] = useState({
    moves: 0,
    hints: 0,
    solved: false,
    score: 0
  });
  const navigate = useNavigate();
  const isTrial = searchParams.get('trial') === 'true';

  // Map board sizes to categories
  const getCategory = (boardSize) => {
    if (boardSize <= 4) return 'classic';
    if (boardSize <= 6) return 'modern';
    if (boardSize <= 8) return 'adventure';
    return 'expert';
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    let interval;
    if (isTimerRunning && !isGamePaused) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isGamePaused]);

  // Check solution automatically whenever queens array changes
  useEffect(() => {
    if (queens.length === size && !isGamePaused) {
      checkSolution();
    }
  }, [queens, size, isGamePaused]);

  const isSafe = (row, col) => {
    return !queens.some(([r, c]) =>
      r === row || c === col || Math.abs(r - row) === Math.abs(c - col)
    );
  };

  const handleCellClick = (row, col) => {
    if (isGamePaused) return;
    
    if (!isTimerRunning) {
      setIsTimerRunning(true);
    }

    const exists = queens.find(([r, c]) => r === row && c === col);
    if (exists) {
      setQueens(queens.filter(([r, c]) => !(r === row && c === col)));
    } else if (isSafe(row, col)) {
      setQueens([...queens, [row, col]]);
      setGameStats(prev => ({ ...prev, moves: prev.moves + 1 }));
    }
  };

  const resetBoard = () => {
    setQueens([]);
    setTimer(0);
    setIsTimerRunning(false);
    setIsGamePaused(false);
    setGameStats({ moves: 0, hints: 0, solved: false, score: 0 });
  };

  const playAgain = () => {
    resetBoard();
    setIsTimerRunning(true);
  };

  const goHome = () => {
    navigate('/');
  };

  const togglePause = () => {
    setIsGamePaused(!isGamePaused);
  };

  const calculateScore = () => {
    const baseScore = size * 100;
    const timePenalty = timer * 2;
    const hintPenalty = gameStats.hints * 50;
    const moveBonus = (size / gameStats.moves) * 50;
    return Math.max(100, baseScore - timePenalty - hintPenalty + moveBonus);
  };

  const checkSolution = async () => {
    const isValid = queens.every(([r1, c1], i) =>
      queens.slice(i + 1).every(([r2, c2]) =>
        r1 !== r2 && c1 !== c2 && Math.abs(r1 - r2) !== Math.abs(c1 - c2)
      )
    );

    if (isValid) {
      setIsTimerRunning(false);
      setIsGamePaused(false);
      const calculatedScore = calculateScore();
      
      setGameStats(prev => ({ 
        ...prev, 
        solved: true,
        score: calculatedScore
      }));
      
      if (user && !isTrial) {
        try {
          const response = await axios.post('http://localhost:5000/api/games', {
            userId: user.id,
            mode,
            category: getCategory(size),
            size,
            queens,
            time: timer,
            moves: gameStats.moves,
            hints: gameStats.hints,
            solved: true,
            score: calculatedScore
          });
          
          setGameStats(prev => ({ ...prev, score: response.data.score || calculatedScore }));
        } catch (err) {
          console.error('Error saving to DB:', err);
        }
      }
    } else {
      setTimeout(() => {
        resetBoard();
      }, 1000);
    }
  };

  const getHint = () => {
    if (isGamePaused || queens.length >= size || gameStats.hints >= 3) return;
    
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (isSafe(row, col)) {
          setQueens([...queens, [row, col]]);
          setGameStats(prev => ({ ...prev, hints: prev.hints + 1 }));
          return;
        }
      }
    }
  };

  const saveToDB = async () => {
    if (!user) {
      alert('Please login to save your game.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/games', {
        userId: user.id,
        mode,
        category: getCategory(size),
        size,
        queens,
        time: timer,
        moves: gameStats.moves,
        hints: gameStats.hints,
        solved: gameStats.solved,
        score: gameStats.score
      });
      
      setGameStats(prev => ({ ...prev, score: response.data.score || prev.score }));
      alert(`Game saved to leaderboard! Your score: ${response.data.score || gameStats.score} points`);
    } catch (err) {
      alert('Error saving to DB.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBoardSize = () => {
    const maxWidth = Math.min(window.innerWidth - 100, 600);
    const maxHeight = Math.min(window.innerHeight - 300, 600);
    const cellSize = Math.min(maxWidth / size, maxHeight / size, 60);
    return Math.max(cellSize, 30);
  };

  const getCategoryName = (category) => {
    const categories = {
      'classic': 'Classic',
      'modern': 'Modern',
      'adventure': 'Adventure',
      'expert': 'Expert'
    };
    return categories[category] || 'Classic';
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="header-top">
          <button onClick={goHome} className="home-btn">
            ← Home
          </button>
          <h1>N-Queens Game - {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode</h1>
          {isTrial && <div className="trial-badge">Trial Mode</div>}
        </div>
        <div className="game-controls">
          <div className="control-group">
            <label htmlFor="board-size">Board Size:</label>
            <select
              id="board-size"
              value={size}
              onChange={(e) => {
                setSize(parseInt(e.target.value));
                resetBoard();
              }}
              disabled={isGamePaused || isTrial}
            >
              <option value={4}>4x4 (Classic)</option>
              <option value={5}>5x5 (Modern)</option>
              <option value={6}>6x6 (Modern)</option>
              <option value={7}>7x7 (Adventure)</option>
              <option value={8}>8x8 (Adventure)</option>
              <option value={9}>9x9 (Expert)</option>
              <option value={10}>10x10 (Expert)</option>
            </select>
          </div>
          
          <div className="game-stats">
            <div className="stat">
              <span>Time:</span>
              <span className="stat-value">{formatTime(timer)}</span>
            </div>
            <div className="stat">
              <span>Moves:</span>
              <span className="stat-value">{gameStats.moves}</span>
            </div>
            <div className="stat">
              <span>Queens:</span>
              <span className="stat-value">{queens.length}/{size}</span>
            </div>
            <div className="stat">
              <span>Category:</span>
              <span className="stat-value">{getCategoryName(getCategory(size))}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="board-container">
        {isGamePaused && (
          <div className="paused-overlay">
            <div className="paused-message">Game Paused</div>
          </div>
        )}
        <div
          className="board"
          style={{ 
            gridTemplateColumns: `repeat(${size}, ${getBoardSize()}px)`,
            gridTemplateRows: `repeat(${size}, ${getBoardSize()}px)`,
            maxWidth: `${size * getBoardSize()}px`,
            maxHeight: `${size * getBoardSize()}px`,
            opacity: isGamePaused ? 0.5 : 1
          }}
        >
          {[...Array(size)].map((_, row) =>
            [...Array(size)].map((_, col) => (
              <Cell
                key={`${row}-${col}`}
                row={row}
                col={col}
                hasQueen={queens.some(([r, c]) => r === row && c === col)}
                onClick={() => handleCellClick(row, col)}
                size={size}
                cellSize={getBoardSize()}
                disabled={isGamePaused}
              />
            ))
          )}
        </div>
      </div>

      <div className="game-actions">
        <button 
          onClick={togglePause} 
          className="action-btn pause-btn"
          disabled={gameStats.solved || !isTimerRunning}
        >
          {isGamePaused ? '▶ Play' : '⏸ Pause'}
        </button>
        <button 
          onClick={resetBoard} 
          className="action-btn reset-btn"
          disabled={isGamePaused}
        >
          Reset Board
        </button>
        <button 
          onClick={getHint} 
          className="action-btn hint-btn" 
          disabled={isGamePaused || queens.length >= size || gameStats.hints >= 3 || isTrial}
        >
          Get Hint ({3 - gameStats.hints} left)
        </button>
        {user && !isTrial && (
          <button 
            onClick={saveToDB} 
            className="action-btn save-btn"
            disabled={isGamePaused}
          >
            Save Game
          </button>
        )}
      </div>

      {gameStats.solved && (
        <div className="success-message">
          <h2>🎉 Puzzle Solved!</h2>
          <p>Time: {formatTime(timer)} | Moves: {gameStats.moves} | Hints: {gameStats.hints}</p>
          
          {isTrial ? (
            <>
              <p>Great job! Sign up to save your progress and unlock all features!</p>
              <div className="post-game-actions">
                <Link to="/signup" className="action-btn signup-btn">
                  Sign Up Now
                </Link>
                <button onClick={goHome} className="action-btn home-btn">
                  Back to Home
                </button>
              </div>
            </>
          ) : (
            <>
              <p>Score: {Math.round(gameStats.score)} points</p>
              <p>Category: {getCategoryName(getCategory(size))}</p>
              <div className="post-game-actions">
                <button onClick={playAgain} className="action-btn play-again-btn">
                  Play Again
                </button>
                <button onClick={goHome} className="action-btn home-btn">
                  Back to Home
                </button>
              </div>
              {user ? (
                <p>Your score has been saved to the leaderboard!</p>
              ) : (
                <p>Sign in to save your score to the leaderboard!</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Board;