import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { 
  Calendar, 
  Trophy, 
  Clock, 
  Flame, 
  Star, 
  Target,
  ChevronRight,
  Gift,
  Crown,
  Medal
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { MobileUtils } from '../utils/mobile'
import Layout from './Layout'
import MobileGameBoard from './MobileGameBoard'

const DailyChallenge = () => {
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const [todayChallenge, setTodayChallenge] = useState(null)
  const [challengeHistory, setChallengeHistory] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [showGame, setShowGame] = useState(false)
  const [userStats, setUserStats] = useState({
    streak: 0,
    completedToday: false,
    totalCompleted: 0,
    bestScore: 0
  })

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  useEffect(() => {
    if (isAuthenticated) {
      fetchTodayChallenge()
      fetchChallengeHistory()
      fetchLeaderboard()
      fetchUserStats()
    }
  }, [isAuthenticated])

  const fetchTodayChallenge = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/daily-challenges/today`)
      setTodayChallenge(response.data)
      
      // Check if user already completed today's challenge
      if (user && response.data.completions) {
        const userCompletion = response.data.completions.find(
          c => c.userId === user._id
        )
        if (userCompletion) {
          setUserStats(prev => ({ ...prev, completedToday: true }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch today\'s challenge:', error)
      toast.error('Failed to load today\'s challenge')
    }
  }

  const fetchChallengeHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/daily-challenges/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setChallengeHistory(response.data)
    } catch (error) {
      console.error('Failed to fetch challenge history:', error)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/daily-challenges/leaderboard`)
      setLeaderboard(response.data)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    // This would typically come from a user stats endpoint
    // For now, we'll calculate from history
    if (challengeHistory.length > 0) {
      const totalCompleted = challengeHistory.length
      const bestScore = Math.max(...challengeHistory.map(h => h.score))
      
      // Calculate streak (consecutive days)
      let streak = 0
      const today = new Date()
      for (let i = 0; i < challengeHistory.length; i++) {
        const challengeDate = new Date(challengeHistory[i].date)
        const daysDiff = Math.floor((today - challengeDate) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === i) {
          streak++
        } else {
          break
        }
      }
      
      setUserStats(prev => ({
        ...prev,
        totalCompleted,
        bestScore,
        streak
      }))
    }
  }

  const handleGameComplete = async (gameData) => {
    if (!gameData.solved || userStats.completedToday) return

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_BASE_URL}/daily-challenges/complete`,
        {
          time: gameData.time,
          moves: gameData.moves,
          hints: gameData.hints || 0,
          solved: gameData.solved
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      const { score, streak } = response.data
      
      toast.success(`🎉 Challenge completed! Score: ${score}`)
      await MobileUtils.triggerHapticFeedback('Heavy')
      
      setUserStats(prev => ({
        ...prev,
        completedToday: true,
        streak,
        totalCompleted: prev.totalCompleted + 1,
        bestScore: Math.max(prev.bestScore, score)
      }))
      
      // Refresh data
      fetchLeaderboard()
      fetchChallengeHistory()
      
    } catch (error) {
      console.error('Failed to complete challenge:', error)
      toast.error(error.response?.data?.message || 'Failed to complete challenge')
    }
  }

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: '#10b981',
      intermediate: '#f59e0b', 
      hard: '#ef4444',
      expert: '#8b5cf6'
    }
    return colors[difficulty] || '#64748b'
  }

  const getDifficultyIcon = (difficulty) => {
    const icons = {
      beginner: '🟢',
      intermediate: '🟡',
      hard: '🔴',
      expert: '🟣'
    }
    return icons[difficulty] || '⚪'
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="daily-challenge-auth">
          <div className="auth-prompt">
            <Calendar size={64} />
            <h2>Daily Challenges</h2>
            <p>Sign in to participate in daily N-Queens challenges and compete with players worldwide!</p>
            <div className="auth-buttons">
              <button onClick={() => window.location.href = '/login'}>
                Sign In
              </button>
              <button onClick={() => window.location.href = '/signup'}>
                Create Account
              </button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (showGame && todayChallenge) {
    return (
      <MobileGameBoard
        size={todayChallenge.boardSize}
        mode="daily-challenge"
        timeLimit={todayChallenge.timeLimit}
        onGameComplete={handleGameComplete}
        onBackHome={() => setShowGame(false)}
      />
    )
  }

  if (loading) {
    return (
      <Layout>
        <div className="daily-challenge-loading">
          <div className="spinner"></div>
          <p>Loading daily challenge...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="daily-challenge-page">
        {/* Header */}
        <motion.div 
          className="challenge-header"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="header-content">
            <h1>
              <Calendar className="header-icon" />
              Daily Challenge
            </h1>
            <p>New challenge every day at midnight UTC</p>
          </div>
          
          {/* User Stats */}
          <div className="user-stats">
            <div className="stat-card">
              <Flame className="stat-icon" />
              <div className="stat-info">
                <span className="stat-value">{userStats.streak}</span>
                <span className="stat-label">Day Streak</span>
              </div>
            </div>
            <div className="stat-card">
              <Trophy className="stat-icon" />
              <div className="stat-info">
                <span className="stat-value">{userStats.totalCompleted}</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>
            <div className="stat-card">
              <Star className="stat-icon" />
              <div className="stat-info">
                <span className="stat-value">{userStats.bestScore}</span>
                <span className="stat-label">Best Score</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Today's Challenge */}
        {todayChallenge && (
          <motion.div 
            className="today-challenge"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="challenge-card">
              <div className="challenge-info">
                <div className="challenge-title">
                  <h2>Today's Challenge</h2>
                  <div 
                    className="difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(todayChallenge.difficulty) }}
                  >
                    <span>{getDifficultyIcon(todayChallenge.difficulty)}</span>
                    <span>{todayChallenge.difficulty}</span>
                  </div>
                </div>
                
                <div className="challenge-details">
                  <div className="detail-item">
                    <Target size={20} />
                    <span>{todayChallenge.boardSize}×{todayChallenge.boardSize} Board</span>
                  </div>
                  <div className="detail-item">
                    <Clock size={20} />
                    <span>{formatTime(todayChallenge.timeLimit)} Time Limit</span>
                  </div>
                  <div className="detail-item">
                    <Gift size={20} />
                    <span>{todayChallenge.points} Base Points</span>
                  </div>
                </div>
              </div>
              
              {userStats.completedToday ? (
                <div className="completed-badge">
                  <Trophy className="trophy-icon" />
                  <span>Completed!</span>
                </div>
              ) : (
                <button 
                  className="play-challenge-btn"
                  onClick={() => setShowGame(true)}
                >
                  <span>Start Challenge</span>
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Today's Leaderboard */}
        <motion.div 
          className="challenge-leaderboard"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2>Today's Top Players</h2>
          {leaderboard.length === 0 ? (
            <div className="empty-leaderboard">
              <Trophy size={48} />
              <p>No completions yet today</p>
              <p>Be the first to complete today's challenge!</p>
            </div>
          ) : (
            <div className="leaderboard-list">
              {leaderboard.slice(0, 10).map((entry, index) => (
                <motion.div
                  key={`${entry.username}-${index}`}
                  className={`leaderboard-entry ${index < 3 ? 'top-three' : ''}`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="rank-section">
                    {index === 0 && <Crown className="crown-icon" />}
                    {index === 1 && <Medal className="medal-silver" />}
                    {index === 2 && <Medal className="medal-bronze" />}
                    {index >= 3 && <span className="rank-number">#{index + 1}</span>}
                  </div>
                  
                  <div className="player-section">
                    <span className="player-name">{entry.username}</span>
                    <div className="player-stats">
                      <span>{entry.score} pts</span>
                      <span>{formatTime(entry.time)}</span>
                      <span>{entry.moves} moves</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Challenge History */}
        {challengeHistory.length > 0 && (
          <motion.div 
            className="challenge-history"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2>Your Recent Challenges</h2>
            <div className="history-list">
              {challengeHistory.slice(0, 7).map((challenge, index) => (
                <div key={index} className="history-entry">
                  <div className="history-date">
                    {new Date(challenge.date).toLocaleDateString()}
                  </div>
                  <div className="history-details">
                    <span className="board-size">{challenge.boardSize}×{challenge.boardSize}</span>
                    <span className="difficulty" style={{ color: getDifficultyColor(challenge.difficulty) }}>
                      {challenge.difficulty}
                    </span>
                    <span className="score">{challenge.score} pts</span>
                  </div>
                  <div className="history-time">
                    {formatTime(challenge.time)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  )
}

export default DailyChallenge