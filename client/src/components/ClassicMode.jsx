import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Star, Trophy, Lock, ChevronRight, Home } from 'lucide-react';
import { OfflineAuth } from '../utils/offlineAuth';
import Layout from './Layout';
import './ClassicMode.css';

const ClassicMode = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userProgress, setUserProgress] = useState({});

  // Classic levels configuration (4x4 to 16x16)
  const classicLevels = [
    { 
      id: 1, 
      size: 4, 
      name: '4×4 Beginner', 
      description: 'Perfect for beginners',
      difficulty: 'Beginner',
      points: 100,
      color: '#4CAF50'
    },
    { 
      id: 2, 
      size: 5, 
      name: '5×5 Easy', 
      description: 'Building confidence',
      difficulty: 'Easy',
      points: 150,
      color: '#8BC34A'
    },
    { 
      id: 3, 
      size: 6, 
      name: '6×6 Intermediate', 
      description: 'Step up the challenge',
      difficulty: 'Intermediate',
      points: 200,
      color: '#FF9800'
    },
    { 
      id: 4, 
      size: 7, 
      name: '7×7 Challenging', 
      description: 'Getting serious',
      difficulty: 'Challenging',
      points: 250,
      color: '#FF5722'
    },
    { 
      id: 5, 
      size: 8, 
      name: '8×8 Advanced', 
      description: 'Classic chess board',
      difficulty: 'Advanced',
      points: 300,
      color: '#2196F3'
    },
    { 
      id: 6, 
      size: 9, 
      name: '9×9 Expert', 
      description: 'For experienced players',
      difficulty: 'Expert',
      points: 350,
      color: '#3F51B5'
    },
    { 
      id: 7, 
      size: 10, 
      name: '10×10 Master', 
      description: 'Mastery challenge',
      difficulty: 'Master',
      points: 400,
      color: '#9C27B0'
    },
    { 
      id: 8, 
      size: 11, 
      name: '11×11 Grandmaster', 
      description: 'Elite level',
      difficulty: 'Grandmaster',
      points: 450,
      color: '#E91E63'
    },
    { 
      id: 9, 
      size: 12, 
      name: '12×12 Legendary', 
      description: 'Legendary difficulty',
      difficulty: 'Legendary',
      points: 500,
      color: '#F44336'
    },
    { 
      id: 10, 
      size: 13, 
      name: '13×13 Ultimate', 
      description: 'Ultimate test',
      difficulty: 'Ultimate',
      points: 550,
      color: '#795548'
    },
    { 
      id: 11, 
      size: 14, 
      name: '14×14 Insane', 
      description: 'Insane difficulty',
      difficulty: 'Insane',
      points: 600,
      color: '#607D8B'
    },
    { 
      id: 12, 
      size: 15, 
      name: '15×15 Nightmare', 
      description: 'Nightmare mode',
      difficulty: 'Nightmare',
      points: 650,
      color: '#424242'
    },
    { 
      id: 13, 
      size: 16, 
      name: '16×16 Impossible', 
      description: 'The ultimate challenge',
      difficulty: 'Impossible',
      points: 700,
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
    const progress = JSON.parse(localStorage.getItem(`classicProgress_${userData.id}`) || '{}');
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

    navigate(`/game/classic?size=${level.size}&level=${level.id}&mode=classic`);
  };

  const getTotalProgress = () => {
    const completed = Object.values(userProgress).filter(p => p.completed).length;
    return Math.round((completed / classicLevels.length) * 100);
  };

  const getTotalPoints = () => {
    return Object.values(userProgress).reduce((total, p) => {
      return total + (p.completed ? p.points || 0 : 0);
    }, 0);
  };

  const getLevelIcon = (level) => {
    if (!isLevelUnlocked(level.id)) {
      return <Lock className="w-6 h-6 text-gray-500" />;
    }
    if (isLevelCompleted(level.id)) {
      return <Trophy className="w-6 h-6 text-yellow-500" />;
    }
    return <Star className="w-6 h-6 text-blue-500" />;
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

  return (
    <Layout>
      <div className="min-h-screen animated-bg p-4">
        {/* Floating Particles Background */}
        <div className="particles fixed inset-0 pointer-events-none z-0">
          {[...Array(15)].map((_, i) => (
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
              CLASSIC MODE
            </h1>
            <p className="text-xl text-gray-300 mb-6 text-center">
              Master the N-Queens puzzle through progressive challenges
            </p>

            {/* Progress Summary */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <div className="status-indicator status-success">
                <Crown className="w-5 h-5" />
                <span className="font-semibold">Progress: {getTotalProgress()}%</span>
              </div>
              <div className="status-indicator status-warning">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">Points: {getTotalPoints().toLocaleString()}</span>
              </div>
              <div className="status-indicator status-success">
                <Star className="w-5 h-5" />
                <span className="font-semibold">
                  Level {Math.max(1, Object.keys(userProgress).filter(k => userProgress[k].completed).length)} / {classicLevels.length}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Level Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {classicLevels.map((level, index) => {
              const status = getLevelStatus(level);
              const isLocked = status === 'locked';
              const isCompleted = status === 'completed';
              
              return (
                <motion.div
                  key={level.id}
                  className={`
                    premium-card cursor-pointer transition-all duration-300
                    ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                    ${isCompleted ? 'ring-2 ring-yellow-400' : ''}
                  `}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => handleLevelSelect(level)}
                >
                  {/* Level Header */}
                  <div className="flex items-center justify-between mb-4">
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
                    className="w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center font-bold text-white text-xl"
                    style={{ backgroundColor: level.color }}
                  >
                    {level.size}×{level.size}
                  </div>

                  {/* Level Info */}
                  <div className="text-center space-y-2">
                    <p className="text-sm text-cool-gray">
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
                      <div className="mt-3 pt-3 border-t border-slate-gray/30">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Time: {Math.floor(userProgress[level.id].timeElapsed / 60)}:{(userProgress[level.id].timeElapsed % 60).toString().padStart(2, '0')}</span>
                          <span>Moves: {userProgress[level.id].moves}</span>
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
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-white">1</span>
                </div>
                <h3 className="font-semibold text-white">Start from Level 1</h3>
                <p className="text-gray-300 text-sm">
                  Begin with the 4×4 board to learn the basics
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-white">2</span>
                </div>
                <h3 className="font-semibold text-white">Progress Sequentially</h3>
                <p className="text-gray-300 text-sm">
                  Complete levels in order to unlock the next challenge
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-white">3</span>
                </div>
                <h3 className="font-semibold text-white">Master All Sizes</h3>
                <p className="text-gray-300 text-sm">
                  Work your way up to the ultimate 16×16 challenge
                </p>
              </div>
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

export default ClassicMode;