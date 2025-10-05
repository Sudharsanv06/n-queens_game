import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Trophy, Clock, Move, Zap, Lightbulb, Home, RotateCcw, Star, Target, Play } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { OfflineAuth } from '../utils/offlineAuth';
import { OfflineGameStore } from '../utils/offlineStore';
import Layout from './Layout';
import './GameBoard.css';

const GameBoard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const size = parseInt(searchParams.get('size')) || 8;
  const mode = searchParams.get('mode') || 'free-trial';
  const level = parseInt(searchParams.get('level')) || null;
  const timeLimit = parseInt(searchParams.get('timeLimit')) || null;
  
  const [board, setBoard] = useState([]);
  const [queens, setQueens] = useState([]);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [gameEndTime, setGameEndTime] = useState(null);
  const [moves, setMoves] = useState(0);
  const [gameStatus, setGameStatus] = useState('playing');
  const [showResult, setShowResult] = useState(false);
  const [isFreeTrial, setIsFreeTrial] = useState(false);
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [hints, setHints] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintCell, setHintCell] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [conflicts, setConflicts] = useState(new Set());

  // Check user login status
  useEffect(() => {
    const userData = OfflineAuth.getCurrentUser();
    
    if (userData) {
      setUser(userData);
      setIsFreeTrial(false);
    } else {
      setIsFreeTrial(mode === 'free-trial');
      // If not authenticated and not a free trial, redirect to login
      if (mode !== 'free-trial') {
        navigate('/login');
        return;
      }
    }
  }, [mode, navigate]);

  // Initialize board
  useEffect(() => {
    const newBoard = Array(size).fill(null).map(() => Array(size).fill(null));
    setBoard(newBoard);
    setQueens([]);
    setMoves(0);
    setHints(0);
    setGameStartTime(Date.now());
    setGameEndTime(null);
    setGameStatus('playing');
    setShowResult(false);
    setTimeLeft(timeLimit);
    setConflicts(new Set());
  }, [size, mode, timeLimit]);

  // Timer logic
  useEffect(() => {
    if (timeLimit && timeLeft > 0 && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLimit && timeLeft === 0 && gameStatus === 'playing') {
      setGameEndTime(Date.now());
      setGameStatus('lost');
      setShowResult(true);
      toast.error('⏰ Time\'s up!', {
        style: {
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#ffffff',
          borderRadius: '12px',
          border: '1px solid rgba(244, 63, 94, 0.6)',
          backdropFilter: 'blur(10px)'
        }
      });
    }
  }, [timeLeft, timeLimit, gameStatus]);

  // Check for conflicts
  const checkConflicts = useCallback((newQueens) => {
    const conflictSet = new Set();
    
    for (let i = 0; i < newQueens.length; i++) {
      for (let j = i + 1; j < newQueens.length; j++) {
        const queen1 = newQueens[i];
        const queen2 = newQueens[j];
        
        if (queen1.row === queen2.row ||
            queen1.col === queen2.col ||
            Math.abs(queen1.row - queen2.row) === Math.abs(queen1.col - queen2.col)) {
          conflictSet.add(`${queen1.row}-${queen1.col}`);
          conflictSet.add(`${queen2.row}-${queen2.col}`);
        }
      }
    }
    
    setConflicts(conflictSet);
    return conflictSet.size === 0;
  }, []);

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (gameStatus !== 'playing') return;

    const cellKey = `${row}-${col}`;
    const existingQueenIndex = queens.findIndex(q => q.row === row && q.col === col);
    
    if (existingQueenIndex !== -1) {
      // Remove queen
      const newQueens = queens.filter((_, index) => index !== existingQueenIndex);
      setQueens(newQueens);
      setMoves(moves + 1);
      checkConflicts(newQueens);
      toast.success('👑 Queen removed', {
        style: {
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#ffffff',
          borderRadius: '12px',
          border: '1px solid rgba(16, 185, 129, 0.6)',
          backdropFilter: 'blur(10px)'
        }
      });
    } else {
      // Add queen
      const newQueens = [...queens, { row, col }];
      setQueens(newQueens);
      setMoves(moves + 1);
      
      const hasConflicts = !checkConflicts(newQueens);
      
      if (hasConflicts) {
        toast.error('⚔️ Queen conflict detected!', {
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#ffffff',
            borderRadius: '12px',
            border: '1px solid rgba(244, 63, 94, 0.6)',
            backdropFilter: 'blur(10px)'
          }
        });
      } else {
        toast.success('✨ Queen placed successfully', {
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#ffffff',
            borderRadius: '12px',
            border: '1px solid rgba(16, 185, 129, 0.6)',
            backdropFilter: 'blur(10px)'
          }
        });
        
        // Check if game is won
        if (newQueens.length === size) {
          setGameEndTime(Date.now());
          setGameStatus('won');
          
          // Calculate points
          const gameTime = Math.floor((Date.now() - gameStartTime) / 1000);
          let baseScore = 1000;
          let speedBonus = 0;
          let movePenalty = moves * 10;
          let difficultyBonus = size * 50;
          let hintsPenalty = hints * 50;
          
          if (timeLimit) {
            const timeUsed = timeLimit - timeLeft;
            speedBonus = Math.max(0, (timeLimit - timeUsed) * 5);
          } else {
            speedBonus = Math.max(0, (300 - gameTime) * 2);
          }
          
          const totalPoints = Math.max(100, baseScore + speedBonus + difficultyBonus - movePenalty - hintsPenalty);
          setPoints(totalPoints);
          
          // Save game result to offline store for leaderboard
          if (user) {
            const gameData = {
              userId: user.id,
              boardSize: size,
              timeElapsed: gameTime,
              moves: moves,
              hints: hints,
              solved: true,
              mode: mode,
              score: totalPoints, // Add the calculated score
              timestamp: new Date().toISOString()
            };
            
            OfflineGameStore.saveGame(gameData);
            
            // Update user stats in OfflineAuth
            if (user.stats) {
              const updatedStats = {
                ...user.stats,
                gamesPlayed: (user.stats.gamesPlayed || 0) + 1,
                gamesWon: (user.stats.gamesWon || 0) + 1,
                totalTime: (user.stats.totalTime || 0) + gameTime
              };
              
              OfflineAuth.updateUserStats({ ...user, stats: updatedStats });
            }
          }
          
          // Handle level completion for Classic and Time Trial modes
          if ((mode === 'classic' || mode === 'time-trial') && level && user) {
            const gameTime = Math.floor((Date.now() - gameStartTime) / 1000);
            const progressKey = mode === 'classic' ? `classicProgress_${user.id}` : `timeTrialProgress_${user.id}`;
            const userProgress = JSON.parse(localStorage.getItem(progressKey) || '{}');
            
            // Calculate points based on mode
            let levelPoints = totalPoints;
            if (mode === 'classic') {
              // Classic mode base points: 100-700 based on level
              levelPoints = Math.max(100, 50 + (level * 50) + totalPoints);
            } else if (mode === 'time-trial') {
              // Time trial mode: bonus for speed
              const timeBonus = timeLimit ? Math.max(0, (timeLimit - gameTime) * 10) : 0;
              levelPoints = Math.max(150, 100 + (level * 50) + totalPoints + timeBonus);
            }
            
            userProgress[level] = {
              completed: true,
              completedAt: new Date().toISOString(),
              points: levelPoints,
              boardSize: size,
              timeElapsed: gameTime,
              moves: moves,
              hints: hints,
              timeLimit: timeLimit
            };
            
            localStorage.setItem(progressKey, JSON.stringify(userProgress));
            
            // Update user stats
            const userStats = user.stats || { 
              gamesPlayed: 0, 
              gamesWon: 0, 
              totalTime: 0, 
              bestTimes: {}, 
              streak: 0, 
              levelCompletions: 0, 
              totalLevelPoints: 0,
              classicLevels: 0,
              timeTrialLevels: 0
            };
            
            if (mode === 'classic') {
              userStats.classicLevels = (userStats.classicLevels || 0) + 1;
            } else {
              userStats.timeTrialLevels = (userStats.timeTrialLevels || 0) + 1;
            }
            
            userStats.levelCompletions = (userStats.levelCompletions || 0) + 1;
            userStats.totalLevelPoints = (userStats.totalLevelPoints || 0) + levelPoints;
            
            // Update user in OfflineAuth
            const updatedUser = { ...user, stats: userStats };
            OfflineAuth.updateUserStats(updatedUser);
            
            // Show appropriate success message
            const modeTitle = mode === 'classic' ? 'Classic Level' : 'Time Trial Level';
            const timeMessage = mode === 'time-trial' && timeLimit ? 
              ` in ${Math.floor(gameTime / 60)}:${(gameTime % 60).toString().padStart(2, '0')}/${Math.floor(timeLimit / 60)}:${(timeLimit % 60).toString().padStart(2, '0')}` : '';
            
            toast.success(`🎉 ${modeTitle} ${level} completed${timeMessage}! 
              ${levelPoints} points earned!`, {
              style: {
                background: 'rgba(15, 23, 42, 0.95)',
                color: '#ffffff',
                borderRadius: '12px',
                border: '1px solid rgba(251, 191, 36, 0.6)',
                backdropFilter: 'blur(10px)',
                maxWidth: '400px'
              }
            });
          }
          
          // Mark level challenge as completed (legacy support)
          if (mode === 'level') {
            const levelParam = searchParams.get('level');
            if (levelParam && user) {
              // Save ONLY user-specific completions (no global save!)
              const userCompletions = JSON.parse(localStorage.getItem(`userCompletions_${user.id}`) || '{}');
              userCompletions[`level_${levelParam}`] = {
                completedAt: new Date().toISOString(),
                points: [100, 120, 150, 180, 220, 250, 280, 300, 350, 500][parseInt(levelParam) - 1] || 500,
                boardSize: size,
                timeElapsed: Math.floor((Date.now() - gameStartTime) / 1000),
                moves: moves,
                hints: hints
              };
              localStorage.setItem(`userCompletions_${user.id}`, JSON.stringify(userCompletions));
              
              // Update user stats
              const userStats = user.stats || { gamesPlayed: 0, gamesWon: 0, totalTime: 0, bestTimes: {}, streak: 0, levelCompletions: 0, totalLevelPoints: 0 };
              userStats.levelCompletions = (userStats.levelCompletions || 0) + 1;
              userStats.totalLevelPoints = (userStats.totalLevelPoints || 0) + userCompletions[`level_${levelParam}`].points;
              
              // Update user in OfflineAuth
              const updatedUser = { ...user, stats: userStats };
              OfflineAuth.updateUserStats(updatedUser);
              
              // Trigger a custom event to notify Home component
              window.dispatchEvent(new CustomEvent('levelCompleted', { 
                detail: { level: parseInt(levelParam), points: userCompletions[`level_${levelParam}`].points } 
              }));
              
              toast.success(`🎉 Level ${levelParam} completed! 
                ${levelParam <= 2 ? '🥉 Bronze' : 
                  levelParam <= 4 ? '🥈 Silver' : 
                  levelParam <= 6 ? '🥇 Gold' : 
                  levelParam <= 8 ? '💎 Diamond' : '👑 Crown'} rank achieved!`, {
                style: {
                  background: 'rgba(15, 23, 42, 0.95)',
                  color: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid rgba(251, 191, 36, 0.6)',
                  backdropFilter: 'blur(10px)',
                  maxWidth: '400px'
                }
              });
            }
          }
          
          // Mark daily challenge as completed (backward compatibility)
          if (mode === 'daily') {
            const day = searchParams.get('day');
            if (day) {
              const completed = JSON.parse(localStorage.getItem('completedChallenges') || '{}');
              completed[day] = new Date().toISOString();
              localStorage.setItem('completedChallenges', JSON.stringify(completed));
            }
          }
          
          setShowResult(true);
          
          // Trigger leaderboard refresh for regular games too
          if (user && mode !== 'level') {
            window.dispatchEvent(new CustomEvent('gameCompleted', { 
              detail: { 
                boardSize: size, 
                timeElapsed: Math.floor((Date.now() - gameStartTime) / 1000),
                moves: moves,
                mode: mode
              } 
            }));
          }
          
          toast.success('🎉 Congratulations! All queens placed!', {
            style: {
              background: 'rgba(15, 23, 42, 0.95)',
              color: '#ffffff',
              borderRadius: '12px',
              border: '1px solid rgba(255, 215, 0, 0.8)',
              backdropFilter: 'blur(10px)'
            }
          });
        }
      }
    }
    
    setSelectedCell(null);
    setShowHint(false);
    setHintCell(null);
  };

  // Calculate points based on performance
  const calculatePoints = () => {
    const gameTime = getGameTime();
    let baseScore = 1000;
    let speedBonus = 0;
    let movePenalty = moves * 10;
    let difficultyBonus = size * 50;
    let hintsPenalty = hints * 50;
    
    if (timeLimit) {
      const timeUsed = timeLimit - timeLeft;
      speedBonus = Math.max(0, (timeLimit - timeUsed) * 5);
    } else {
      speedBonus = Math.max(0, (300 - gameTime) * 2);
    }
    
    const totalPoints = Math.max(0, baseScore + speedBonus + difficultyBonus - movePenalty - hintsPenalty);
    setPoints(totalPoints);
  };

  // Get hint for next safe move
  const getHint = () => {
    if (hints >= 3) {
      toast.error('💡 Maximum hints used!', {
        style: {
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#ffffff',
          borderRadius: '12px',
          border: '1px solid rgba(245, 158, 11, 0.6)',
          backdropFilter: 'blur(10px)'
        }
      });
      return;
    }

    // Find a safe position
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (!queens.find(q => q.row === row && q.col === col)) {
          const testQueens = [...queens, { row, col }];
          if (checkConflicts(testQueens)) {
            setHintCell({ row, col });
            setShowHint(true);
            setHints(hints + 1);
            toast.success('💡 Hint revealed!', {
              style: {
                background: 'rgba(15, 23, 42, 0.95)',
                color: '#ffffff',
                borderRadius: '12px',
                border: '1px solid rgba(245, 158, 11, 0.6)',
                backdropFilter: 'blur(10px)'
              }
            });
            return;
          }
        }
      }
    }
    
    toast.error('❌ No obvious hints available', {
      style: {
        background: 'rgba(15, 23, 42, 0.95)',
        color: '#ffffff',
        borderRadius: '12px',
        border: '1px solid rgba(245, 158, 11, 0.6)',
        backdropFilter: 'blur(10px)'
      }
    });
  };

  // Reset game
  const resetGame = () => {
    const newBoard = Array(size).fill(null).map(() => Array(size).fill(null));
    setBoard(newBoard);
    setQueens([]);
    setMoves(0);
    setHints(0);
    setGameStartTime(Date.now());
    setGameEndTime(null);
    setGameStatus('playing');
    setShowResult(false);
    setTimeLeft(timeLimit);
    setPoints(0);
    setConflicts(new Set());
    setSelectedCell(null);
    setShowHint(false);
    setHintCell(null);
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

  // Get current time display
  const getCurrentTimeDisplay = () => {
    if (timeLimit && gameStatus === 'playing') {
      // Show countdown for time trial mode
      return `⏰ ${formatTime(timeLeft)}`;
    } else if (timeLimit && gameStatus !== 'playing') {
      // Show final time after game ends in time trial
      return formatTime(getGameTime());
    } else {
      // Show elapsed time for classic mode
      return formatTime(getGameTime());
    }
  };

  // Handle play again
  const handlePlayAgain = () => {
    if (isFreeTrial) {
      navigate('/signup');
    } else if (mode === 'classic') {
      navigate('/classic-mode');
    } else if (mode === 'time-trial') {
      navigate('/time-trial-mode');
    } else {
      navigate('/registered-game-modes');
    }
  };

  // Handle back to home
  const handleBackToHome = () => {
    navigate('/');
  };

  // Render cell with premium styling
  const renderCell = (rowIndex, colIndex) => {
    const cellKey = `${rowIndex}-${colIndex}`;
    const hasQueen = queens.some(q => q.row === rowIndex && q.col === colIndex);
    const isLight = (rowIndex + colIndex) % 2 === 0;
    const isHinted = hintCell && hintCell.row === rowIndex && hintCell.col === colIndex;
    const isConflicted = conflicts.has(cellKey);
    const isSelected = selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex;
    
    return (
      <motion.div
        key={cellKey}
        className={`
          chess-square 
          ${isLight ? 'light' : 'dark'} 
          ${hasQueen ? 'has-queen' : ''}
          ${isSelected ? 'selected' : ''}
          ${isHinted ? 'hinted' : ''}
          ${isConflicted ? 'conflicted' : ''}
        `}
        onClick={() => handleCellClick(rowIndex, colIndex)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.3, 
          delay: (rowIndex * size + colIndex) * 0.01,
          ease: "easeOut"
        }}
      >
        {hasQueen && (
          <motion.span
            className="queen"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            whileHover={{ 
              scale: 1.2, 
              rotate: 5
            }}
          >
            ♛
          </motion.span>
        )}
        
        {isHinted && !hasQueen && (
          <motion.div
            className="hint-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Lightbulb className="hint-icon" />
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <>
      <Toaster position="top-center" />
      <Layout>
        <div className="min-h-screen bg-ultra-gradient animate-gradient-shift bg-size-400 p-4">
          {/* Floating Particles Background */}
          <div className="fixed inset-0 pointer-events-none z-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="particle absolute w-1 h-1 bg-cyan-glow rounded-full animate-float opacity-70"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 6}s`,
                  animationDuration: `${6 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>

          <div className="relative z-10 max-w-6xl mx-auto">
            {/* Ultra Premium Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-orbitron font-black text-4xl md:text-5xl mb-4 bg-gradient-to-r from-golden-yellow via-sunset-orange to-rose-pink bg-clip-text text-transparent">
                {mode === 'classic' ? 'CLASSIC MODE' : mode === 'time-trial' ? 'TIME TRIAL' : 'N-QUEENS CHALLENGE'}
                {level && <span className="block text-2xl mt-2 text-electric-blue">Level {level}</span>}
              </h1>
              
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <div className="glass-card px-4 py-2 rounded-ultra">
                  <div className="flex items-center gap-2 text-electric-blue">
                    <Target className="w-4 h-4" />
                    <span className="font-semibold">{size}×{size}</span>
                  </div>
                </div>
                <div className="glass-card px-4 py-2 rounded-ultra">
                  <div className="flex items-center gap-2 text-emerald-green">
                    <Crown className="w-4 h-4" />
                    <span className="font-semibold">{queens.length}/{size}</span>
                  </div>
                </div>
                <div className="glass-card px-4 py-2 rounded-ultra">
                  <div className="flex items-center gap-2 text-golden-yellow">
                    <Move className="w-4 h-4" />
                    <span className="font-semibold">{moves}</span>
                  </div>
                </div>
                <div className={`glass-card px-4 py-2 rounded-ultra ${timeLimit && timeLeft <= 30 && gameStatus === 'playing' ? 'animate-pulse bg-red-500/20' : ''}`}>
                  <div className={`flex items-center gap-2 ${timeLimit && gameStatus === 'playing' ? 'text-rose-pink' : 'text-golden-yellow'}`}>
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold">{getCurrentTimeDisplay()}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Game Content */}
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Game Board */}
              <div className="lg:col-span-3">
                <motion.div
                  className="glass-card p-6 rounded-ultra"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div 
                    className="chess-board mx-auto max-w-lg"
                    style={{
                      gridTemplateColumns: `repeat(${size}, 1fr)`,
                      gridTemplateRows: `repeat(${size}, 1fr)`
                    }}
                  >
                    {board.map((row, rowIndex) =>
                      row.map((_, colIndex) => renderCell(rowIndex, colIndex))
                    )}
                  </div>
                  
                  <div className="game-instructions mt-6 text-center">
                    <p className="text-cool-gray mb-2">
                      Click squares to place queens. Queens cannot attack each other.
                    </p>
                    <p className="text-electric-blue font-semibold">
                      Place {size} queens to win! 👑
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Game Controls & Stats */}
              <div className="space-y-6">
                {/* Action Buttons */}
                <motion.div
                  className="glass-card p-6 rounded-ultra space-y-4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <h3 className="font-orbitron font-bold text-xl text-electric-blue mb-4">
                    Game Controls
                  </h3>
                  
                  <button
                    onClick={getHint}
                    disabled={hints >= 3}
                    className={`
                      w-full btn-primary flex items-center justify-center gap-2
                      ${hints >= 3 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-neon-blue'}
                    `}
                  >
                    <Lightbulb className="w-5 h-5" />
                    Hint ({3 - hints} left)
                  </button>

                  <button
                    onClick={resetGame}
                    className="w-full btn-primary bg-gradient-to-r from-emerald-green to-cyan-glow flex items-center justify-center gap-2 hover:shadow-neon"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reset Game
                  </button>

                  <button
                    onClick={handleBackToHome}
                    className="w-full btn-primary bg-gradient-to-r from-slate-gray to-cool-gray flex items-center justify-center gap-2"
                  >
                    <Home className="w-5 h-5" />
                    Back Home
                  </button>
                </motion.div>

                {/* Game Stats */}
                <motion.div
                  className="glass-card p-6 rounded-ultra space-y-4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <h3 className="font-orbitron font-bold text-xl text-golden-yellow mb-4">
                    Statistics
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-cool-gray">Score:</span>
                      <span className="font-bold text-golden-yellow">{points.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-cool-gray">Efficiency:</span>
                      <span className="font-bold text-emerald-green">
                        {moves > 0 ? Math.round((queens.length / moves) * 100) : 0}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-cool-gray">Conflicts:</span>
                      <span className={`font-bold ${conflicts.size > 0 ? 'text-rose-pink' : 'text-emerald-green'}`}>
                        {conflicts.size / 2}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-cool-gray">Duration:</span>
                      <span className="font-bold text-electric-blue">
                        {formatTime(getGameTime())}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Game Result Modal */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="glass-card max-w-md w-full p-8 rounded-ultra text-center"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <div className="mb-6">
                    {gameStatus === 'won' ? (
                      <div className="space-y-4">
                        <Trophy className="w-20 h-20 text-golden-yellow mx-auto animate-bounce" />
                        <h2 className="font-orbitron font-bold text-3xl text-golden-yellow">
                          🎉 Victory!
                        </h2>
                        <p className="text-light-gray">
                          Amazing! You solved the {size}×{size} N-Queens puzzle!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Clock className="w-20 h-20 text-rose-pink mx-auto" />
                        <h2 className="font-orbitron font-bold text-3xl text-rose-pink">
                          ⏰ Time's Up!
                        </h2>
                        <p className="text-light-gray">
                          Better luck next time!
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 mb-8 p-4 bg-dark-card rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-cool-gray">Time:</span>
                      <span className="text-electric-blue font-bold">{formatTime(getGameTime())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cool-gray">Moves:</span>
                      <span className="text-golden-yellow font-bold">{moves}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cool-gray">Board Size:</span>
                      <span className="text-emerald-green font-bold">{size}×{size}</span>
                    </div>
                    {points > 0 && (
                      <div className="flex justify-between border-t border-slate-gray pt-2">
                        <span className="text-cool-gray">Final Score:</span>
                        <span className="text-golden-yellow font-bold text-xl">{points.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      className="btn-primary flex items-center justify-center gap-2"
                      onClick={handlePlayAgain}
                    >
                      <Play className="w-5 h-5" />
                      {isFreeTrial ? 'Sign Up to Play More' : 'Play Again'}
                    </button>
                    <button
                      className="btn-primary bg-gradient-to-r from-slate-gray to-cool-gray flex items-center justify-center gap-2"
                      onClick={handleBackToHome}
                    >
                      <Home className="w-5 h-5" />
                      Back to Home
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Layout>
    </>
  );
};

export default GameBoard;
