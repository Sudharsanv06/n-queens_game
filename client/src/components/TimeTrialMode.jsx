import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Star, Trophy, Lock, ChevronRight, Home, Zap, Timer } from 'lucide-react';
import { OfflineAuth } from '../utils/offlineAuth';
import Layout from './Layout';
import './TimeTrialMode.css';

const TimeTrialMode = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userProgress, setUserProgress] = useState({});

  // Time Trial levels configuration (4x4 to 16x16) with decreasing time limits
  const timeTrialLevels = [
    { 
      id: 1, 
      size: 4, 
      name: '4×4 Sprint', 
      description: 'Quick warm-up',
      difficulty: 'Sprint',
      points: 150,
      timeLimit: 120, // 2 minutes
      color: '#4CAF50'
    },
    { 
      id: 2, 
      size: 5, 
      name: '5×5 Rush', 
      description: 'Building speed',
      difficulty: 'Rush',
      points: 200,
      timeLimit: 180, // 3 minutes
      color: '#8BC34A'
    },
    { 
      id: 3, 
      size: 6, 
      name: '6×6 Dash', 
      description: 'Quick thinking required',
      difficulty: 'Dash',
      points: 250,
      timeLimit: 240, // 4 minutes
      color: '#FF9800'
    },
    { 
      id: 4, 
      size: 7, 
      name: '7×7 Blitz', 
      description: 'Lightning fast',
      difficulty: 'Blitz',
      points: 300,
      timeLimit: 300, // 5 minutes
      color: '#FF5722'
    },
    { 
      id: 5, 
      size: 8, 
      name: '8×8 Speed', 
      description: 'Classic under pressure',
      difficulty: 'Speed',
      points: 350,
      timeLimit: 360, // 6 minutes
      color: '#2196F3'
    },
    { 
      id: 6, 
      size: 9, 
      name: '9×9 Rapid', 
      description: 'Rapid fire challenge',
      difficulty: 'Rapid',
      points: 400,
      timeLimit: 420, // 7 minutes
      color: '#3F51B5'
    },
    { 
      id: 7, 
      size: 10, 
      name: '10×10 Flash', 
      description: 'Flash of genius needed',
      difficulty: 'Flash',
      points: 450,
      timeLimit: 480, // 8 minutes
      color: '#9C27B0'
    },
    { 
      id: 8, 
      size: 11, 
      name: '11×11 Lightning', 
      description: 'Lightning reflexes',
      difficulty: 'Lightning',
      points: 500,
      timeLimit: 540, // 9 minutes
      color: '#E91E63'
    },
    { 
      id: 9, 
      size: 12, 
      name: '12×12 Thunder', 
      description: 'Thunder strike speed',
      difficulty: 'Thunder',
      points: 550,
      timeLimit: 600, // 10 minutes
      color: '#F44336'
    },
    { 
      id: 10, 
      size: 13, 
      name: '13×13 Storm', 
      description: 'Storm the puzzle',
      difficulty: 'Storm',
      points: 600,
      timeLimit: 660, // 11 minutes
      color: '#795548'
    },
    { 
      id: 11, 
      size: 14, 
      name: '14×14 Tornado', 
      description: 'Whirlwind challenge',
      difficulty: 'Tornado',
      points: 650,
      timeLimit: 720, // 12 minutes
      color: '#607D8B'
    },
    { 
      id: 12, 
      size: 15, 
      name: '15×15 Hurricane', 
      description: 'Hurricane force',
      difficulty: 'Hurricane',
      points: 700,
      timeLimit: 780, // 13 minutes
      color: '#424242'
    },
    { 
      id: 13, 
      size: 16, 
      name: '16×16 Supersonic', 
      description: 'Break the speed barrier',
      difficulty: 'Supersonic',
      points: 750,
      timeLimit: 840, // 14 minutes
      color: '#000000'
    }
  ];

  useEffect(() => {
    const userData = OfflineAuth.getCurrentUser();
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);

    // Load user progress
    const progress = JSON.parse(localStorage.getItem(`timeTrialProgress_${userData.id}`) || '{}');
    setUserProgress(progress);
  }, [navigate]);

  const isLevelUnlocked = (levelId) => {
    if (levelId === 1) return true; // First level always unlocked
    return userProgress[levelId - 1]?.completed || false;
  };

  const isLevelCompleted = (levelId) => {
    return userProgress[levelId]?.completed || false;
  };

  const handleLevelSelect = (level) => {
    if (!isLevelUnlocked(level.id)) {
      return; // Level is locked
    }

    navigate(`/game/time-trial?size=${level.size}&level=${level.id}&mode=time-trial&timeLimit=${level.timeLimit}`);
  };

  const getTotalProgress = () => {
    const completed = Object.values(userProgress).filter(p => p.completed).length;
    return Math.round((completed / timeTrialLevels.length) * 100);
  };

  const getTotalPoints = () => {
    return Object.values(userProgress).reduce((total, p) => {
      return total + (p.completed ? p.points || 0 : 0);
    }, 0);
  };

  const getBestTime = () => {
    const completedLevels = Object.values(userProgress).filter(p => p.completed);
    if (completedLevels.length === 0) return null;
    
    const bestTime = Math.min(...completedLevels.map(p => p.timeElapsed));
    return bestTime;
  };

  const getLevelIcon = (level) => {
    if (!isLevelUnlocked(level.id)) {
      return <Lock className="w-6 h-6 text-gray-500" />;
    }
    if (isLevelCompleted(level.id)) {
      return <Trophy className="w-6 h-6 text-yellow-500" />;
    }
    return <Zap className="w-6 h-6 text-blue-500" />;
  };

  const getLevelStatus = (level) => {
    if (!isLevelUnlocked(level.id)) {
      return 'locked';
    }
    if (isLevelCompleted(level.id)) {
      return 'completed';
    }
    return 'available';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout>
      <div className="min-h-screen animated-bg p-4">
        {/* Floating Particles Background */}
        <div className="particles fixed inset-0 pointer-events-none z-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${6 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="heading-primary mb-4">
              TIME TRIAL MODE
            </h1>
            <p className="text-xl text-gray-300 mb-6 text-center">
              Race against the clock in high-speed N-Queens challenges
            </p>

            {/* Progress Summary */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <div className="status-indicator status-success">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">Progress: {getTotalProgress()}%</span>
              </div>
              <div className="status-indicator status-warning">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">Points: {getTotalPoints().toLocaleString()}</span>
              </div>
              <div className="status-indicator status-success">
                <Zap className="w-5 h-5" />
                <span className="font-semibold">
                  Level {Math.max(1, Object.keys(userProgress).filter(k => userProgress[k].completed).length)} / {timeTrialLevels.length}
                </span>
              </div>
              {getBestTime() && (
                <div className="status-indicator status-error">
                  <Timer className="w-5 h-5" />
                  <span className="font-semibold">Best: {formatTime(getBestTime())}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Level Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {timeTrialLevels.map((level, index) => {
              const status = getLevelStatus(level);
              const isLocked = status === 'locked';
              const isCompleted = status === 'completed';
              
              return (
                <motion.div
                  key={level.id}
                  className={`
                    premium-card cursor-pointer transition-all duration-300 relative overflow-hidden
                    ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                    ${isCompleted ? 'ring-2 ring-blue-400' : ''}
                  `}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => handleLevelSelect(level)}
                >
                  {/* Time Trial Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent -skew-x-12 animate-pulse" />
                  
                  {/* Level Header */}
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      {getLevelIcon(level)}
                      <div>
                        <h3 className="font-orbitron font-bold text-lg text-white">
                          Level {level.id}
                        </h3>
                        <p className="text-sm text-cool-gray">
                          {level.name}
                        </p>
                      </div>
                    </div>
                    {!isLocked && (
                      <ChevronRight className="w-5 h-5 text-blue-400" />
                    )}
                  </div>

                  {/* Board Size Display */}
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center font-bold text-white text-xl relative z-10"
                    style={{ backgroundColor: level.color }}
                  >
                    {level.size}×{level.size}
                  </div>

                  {/* Time Limit Display */}
                  <div className="text-center mb-4 relative z-10">
                    <div className="flex items-center justify-center gap-2 text-red-400 font-bold text-lg">
                      <Clock className="w-5 h-5" />
                      {formatTime(level.timeLimit)}
                    </div>
                    <p className="text-xs text-gray-400">Time Limit</p>
                  </div>

                  {/* Level Info */}
                  <div className="text-center space-y-2 relative z-10">
                    <p className="text-sm text-gray-300">
                      {level.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span 
                        className="px-2 py-1 rounded-lg text-xs font-semibold text-white"
                        style={{ backgroundColor: level.color }}
                      >
                        {level.difficulty}
                      </span>
                      <span className="text-yellow-400 font-semibold">
                        {level.points} pts
                      </span>
                    </div>
                    
                    {/* Completion Status */}
                    {isCompleted && userProgress[level.id] && (
                      <div className="mt-3 pt-3 border-t border-gray-600/30">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Completed: {formatTime(userProgress[level.id].timeElapsed)}</span>
                          <span>Moves: {userProgress[level.id].moves}</span>
                        </div>
                        <div className="text-xs text-green-400 font-semibold mt-1">
                          Time Saved: {formatTime(level.timeLimit - userProgress[level.id].timeElapsed)}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Instructions */}
          <motion.div
            className="premium-card mb-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="heading-secondary text-center mb-4">
              Time Trial Rules
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white">Beat the Clock</h3>
                <p className="text-gray-300 text-sm">
                  Each level has a countdown timer. Complete the puzzle before time runs out!
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white">Speed Bonus</h3>
                <p className="text-gray-300 text-sm">
                  Faster completion times earn higher scores and speed bonuses
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white">Progressive Unlock</h3>
                <p className="text-gray-300 text-sm">
                  Complete levels sequentially to unlock bigger, more challenging boards
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-pink-400/20 to-blue-400/20 rounded-lg border border-pink-400/30">
              <div className="flex items-center gap-2 text-pink-400 font-semibold mb-2">
                <Timer className="w-5 h-5" />
                Pro Tip
              </div>
              <p className="text-gray-300 text-sm">
                The timer counts down from your time limit. Plan your moves quickly but carefully - 
                you can't afford mistakes in Time Trial mode!
              </p>
            </div>
          </motion.div>

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={() => navigate('/registered-game-modes')}
              className="btn-primary flex items-center justify-center gap-2 mx-auto"
            >
              <Home className="w-5 h-5" />
              Back to Game Modes
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TimeTrialMode;