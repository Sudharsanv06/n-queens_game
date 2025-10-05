import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { Crown, Trophy, Clock, Move, Zap, Lightbulb, Home, RotateCcw } from 'lucide-react'
import { MobileUtils, TouchGestureHelper } from '../utils/mobile'
import { saveGame } from '../store/slices/gameSlice'
import toast from 'react-hot-toast'

const MobileGameBoard = ({ 
  size = 8, 
  mode = 'classic', 
  timeLimit = null, 
  onGameComplete, 
  onBackHome 
}) => {
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const boardRef = useRef(null)
  const [gestureHelper, setGestureHelper] = useState(null)
  
  // Game state
  const [board, setBoard] = useState([])
  const [queens, setQueens] = useState([])
  const [gameStartTime, setGameStartTime] = useState(null)
  const [gameEndTime, setGameEndTime] = useState(null)
  const [moves, setMoves] = useState(0)
  const [gameStatus, setGameStatus] = useState('playing') // playing, won, lost, paused
  const [showResult, setShowResult] = useState(false)
  const [hints, setHints] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [score, setScore] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [hintCell, setHintCell] = useState(null)
  
  // Mobile-specific states
  const [selectedCell, setSelectedCell] = useState(null)
  const [draggedQueen, setDraggedQueen] = useState(null)
  const [isGamePaused, setIsGamePaused] = useState(false)

  // Initialize game
  useEffect(() => {
    const newBoard = Array(size).fill(null).map(() => Array(size).fill(null))
    setBoard(newBoard)
    setQueens([])
    setMoves(0)
    setHints(0)
    setGameStartTime(Date.now())
    setGameEndTime(null)
    setGameStatus('playing')
    setShowResult(false)
    setTimeLeft(timeLimit)
    setScore(0)
    setSelectedCell(null)
    setHintCell(null)
  }, [size, mode, timeLimit])

  // Initialize mobile utils and gestures
  useEffect(() => {
    MobileUtils.initializeMobileApp()

    if (boardRef.current) {
      const helper = new TouchGestureHelper(boardRef.current, {
        onSwipe: (direction) => {
          handleSwipeGesture(direction)
        }
      })
      setGestureHelper(helper)

      return () => {
        helper?.destroy()
      }
    }
  }, [boardRef.current])

  // Timer effect
  useEffect(() => {
    if (timeLimit && timeLeft > 0 && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLimit && timeLeft === 0 && gameStatus === 'playing') {
      handleGameEnd('lost')
    }
  }, [timeLeft, timeLimit, gameStatus])

  // Background/foreground handling for mobile
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && gameStatus === 'playing') {
        setIsGamePaused(true)
      } else if (!document.hidden && isGamePaused) {
        setIsGamePaused(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [gameStatus, isGamePaused])

  const handleSwipeGesture = (direction) => {
    // Handle swipe gestures for navigation or game actions
    if (direction === 'right' && onBackHome) {
      onBackHome()
    }
  }

  const isSafe = useCallback((row, col, currentQueens) => {
    for (const queen of currentQueens) {
      if (queen.row === row || 
          queen.col === col || 
          Math.abs(queen.row - row) === Math.abs(queen.col - col)) {
        return false
      }
    }
    return true
  }, [])

  const handleCellTouch = async (row, col) => {
    if (gameStatus !== 'playing') return

    await MobileUtils.triggerHapticFeedback()

    const existingQueenIndex = queens.findIndex(q => q.row === row && q.col === col)
    
    if (existingQueenIndex !== -1) {
      // Remove queen
      const newQueens = queens.filter((_, index) => index !== existingQueenIndex)
      setQueens(newQueens)
      setMoves(moves + 1)
    } else {
      // Add queen if safe
      if (isSafe(row, col, queens)) {
        const newQueens = [...queens, { row, col }]
        setQueens(newQueens)
        setMoves(moves + 1)
        
        if (newQueens.length === size) {
          handleGameEnd('won')
        }
      } else {
        // Invalid move - show error
        await MobileUtils.triggerHapticFeedback('Heavy')
        toast.error('Invalid move! Queen would be attacked.')
      }
    }
  }

  const handleGameEnd = (status) => {
    setGameEndTime(Date.now())
    setGameStatus(status)
    
    if (status === 'won') {
      const calculatedScore = calculateScore()
      setScore(calculatedScore)
      
      if (isAuthenticated && user) {
        // Save game to backend
        dispatch(saveGame({
          userId: user._id,
          mode,
          size,
          queens,
          time: getGameTime(),
          moves,
          hints,
          score: calculatedScore,
          solved: true
        }))
      }

      toast.success('🎉 Congratulations!')
      MobileUtils.triggerHapticFeedback('Heavy')
    } else {
      toast.error('Time\'s up!')
    }
    
    setShowResult(true)
  }

  const calculateScore = () => {
    const gameTime = getGameTime()
    const baseScore = 1000
    const speedBonus = Math.max(0, (300 - gameTime) * 2)
    const movePenalty = moves * 10
    const hintPenalty = hints * 100
    const difficultyBonus = size * 50
    
    return Math.max(0, baseScore + speedBonus + difficultyBonus - movePenalty - hintPenalty)
  }

  const getGameTime = () => {
    if (!gameStartTime) return 0
    const endTime = gameEndTime || Date.now()
    return Math.floor((endTime - gameStartTime) / 1000)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleHint = () => {
    if (hints >= 3) {
      toast.error('Maximum hints used!')
      return
    }

    // Find a safe position for next queen
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const hasQueen = queens.some(q => q.row === row && q.col === col)
        if (!hasQueen && isSafe(row, col, queens)) {
          setHintCell({ row, col })
          setShowHint(true)
          setHints(hints + 1)
          
          setTimeout(() => {
            setShowHint(false)
            setHintCell(null)
          }, 3000)
          
          return
        }
      }
    }
    
    toast.error('No safe positions found!')
  }

  const handleRestart = () => {
    setQueens([])
    setMoves(0)
    setHints(0)
    setGameStartTime(Date.now())
    setGameEndTime(null)
    setGameStatus('playing')
    setShowResult(false)
    setTimeLeft(timeLimit)
    setScore(0)
    setHintCell(null)
  }

  const getDifficultyInfo = () => {
    if (size <= 4) return { name: 'Beginner', color: '#10b981', icon: '🟢' }
    if (size <= 6) return { name: 'Intermediate', color: '#f59e0b', icon: '🟡' }
    if (size <= 8) return { name: 'Hard', color: '#ef4444', icon: '🔴' }
    return { name: 'Expert', color: '#8b5cf6', icon: '🟣' }
  }

  const difficulty = getDifficultyInfo()

  return (
    <div className="mobile-game-container">
      {/* Header */}
      <motion.div 
        className="game-header-mobile"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="header-row">
          <button
            onClick={onBackHome}
            className="back-button"
            aria-label="Back to home"
          >
            <Home size={20} />
          </button>
          
          <div className="game-title">
            <Crown className="crown-icon" />
            <span>{size}×{size} N-Queens</span>
          </div>
          
          <button
            onClick={handleRestart}
            className="restart-button"
            aria-label="Restart game"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        <div className="difficulty-badge" style={{ backgroundColor: difficulty.color }}>
          <span>{difficulty.icon}</span>
          <span>{difficulty.name}</span>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div 
        className="stats-row-mobile"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="stat-item">
          <Clock size={16} />
          <span>{timeLimit ? formatTime(timeLeft) : formatTime(getGameTime())}</span>
        </div>
        <div className="stat-item">
          <Move size={16} />
          <span>{moves}</span>
        </div>
        <div className="stat-item">
          <Trophy size={16} />
          <span>{queens.length}/{size}</span>
        </div>
        {hints > 0 && (
          <div className="stat-item">
            <Lightbulb size={16} />
            <span>{hints}/3</span>
          </div>
        )}
      </motion.div>

      {/* Game Board */}
      <motion.div 
        className="board-container-mobile"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        ref={boardRef}
      >
        <div 
          className="chess-board-mobile"
          style={{
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            gridTemplateRows: `repeat(${size}, 1fr)`,
          }}
        >
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const hasQueen = queens.some(q => q.row === rowIndex && q.col === colIndex)
              const isLight = (rowIndex + colIndex) % 2 === 0
              const isHint = hintCell && hintCell.row === rowIndex && hintCell.col === colIndex
              
              return (
                <motion.div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    chess-square-mobile 
                    ${isLight ? 'light' : 'dark'}
                    ${hasQueen ? 'has-queen' : ''}
                    ${isHint ? 'hint-cell' : ''}
                  `}
                  onClick={() => handleCellTouch(rowIndex, colIndex)}
                  whileTap={{ scale: 0.95 }}
                  animate={isHint && showHint ? {
                    boxShadow: [
                      '0 0 0px rgba(59, 130, 246, 0.4)',
                      '0 0 20px rgba(59, 130, 246, 0.8)',
                      '0 0 0px rgba(59, 130, 246, 0.4)',
                    ]
                  } : {}}
                  transition={{ 
                    duration: isHint ? 0.5 : 0.2,
                    repeat: isHint && showHint ? Infinity : 0
                  }}
                >
                  <AnimatePresence>
                    {hasQueen && (
                      <motion.div
                        className="queen-mobile"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      >
                        ♛
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {isHint && showHint && (
                    <motion.div
                      className="hint-indicator"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                    >
                      <Lightbulb size={16} />
                    </motion.div>
                  )}
                </motion.div>
              )
            })
          )}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        className="action-buttons-mobile"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <button
          onClick={handleHint}
          disabled={hints >= 3}
          className="hint-button"
        >
          <Lightbulb size={20} />
          <span>Hint ({3 - hints})</span>
        </button>
      </motion.div>

      {/* Game Result Modal */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            className="result-overlay-mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="result-modal-mobile"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
            >
              <div className="result-header">
                <h2>
                  {gameStatus === 'won' ? '🎉 Victory!' : '⏰ Time\'s Up!'}
                </h2>
                {gameStatus === 'won' && (
                  <div className="score-display">
                    <Zap className="score-icon" />
                    <span>{score} points</span>
                  </div>
                )}
              </div>

              <div className="result-stats">
                <div className="stat">
                  <Clock size={18} />
                  <span>Time: {formatTime(getGameTime())}</span>
                </div>
                <div className="stat">
                  <Move size={18} />
                  <span>Moves: {moves}</span>
                </div>
                <div className="stat">
                  <Crown size={18} />
                  <span>Board: {size}×{size}</span>
                </div>
                {hints > 0 && (
                  <div className="stat">
                    <Lightbulb size={18} />
                    <span>Hints: {hints}</span>
                  </div>
                )}
              </div>

              <div className="result-actions">
                <button
                  onClick={handleRestart}
                  className="play-again-btn"
                >
                  Play Again
                </button>
                <button
                  onClick={() => {
                    MobileUtils.shareGame({
                      size,
                      time: getGameTime(),
                      score
                    })
                  }}
                  className="share-btn"
                >
                  Share Result
                </button>
                <button
                  onClick={onBackHome}
                  className="home-btn"
                >
                  Back Home
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause overlay */}
      <AnimatePresence>
        {isGamePaused && (
          <motion.div
            className="pause-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="pause-content">
              <h3>Game Paused</h3>
              <p>Tap anywhere to continue</p>
              <button
                onClick={() => setIsGamePaused(false)}
                className="continue-btn"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MobileGameBoard