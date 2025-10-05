// Simple Offline N-Queens Game Component
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { OfflineGameLogic } from '../utils/offlineGameLogic'
import { OfflineAuth } from '../utils/offlineAuth'
import Layout from './Layout'
import './GameBoard.css'

const OfflineNQueensGame = () => {
  const navigate = useNavigate()
  const [gameState, setGameState] = useState(null)
  const [selectedSize, setSelectedSize] = useState(8)
  const [showHint, setShowHint] = useState(null)
  const [gameStats, setGameStats] = useState(null)

  // Initialize game
  useEffect(() => {
    startNewGame(selectedSize)
  }, [])

  const startNewGame = (size = 8) => {
    const newGame = OfflineGameLogic.createBoard(size)
    setGameState(newGame)
    setSelectedSize(size)
    setShowHint(null)
    setGameStats(null)
  }

  const handleCellClick = (row, col) => {
    if (!gameState || gameState.isComplete) return

    const result = OfflineGameLogic.toggleQueen(gameState, row, col)
    
    if (result.success) {
      setGameState({ ...result.gameState })
      
      if (result.isComplete) {
        // Game completed!
        const stats = OfflineGameLogic.getGameStats(result.gameState)
        setGameStats(stats)
        
        // Save to offline storage
        const currentUser = OfflineAuth.getCurrentUser()
        if (currentUser) {
          // Save game progress with proper scoring
          const gameData = {
            userId: currentUser.id,
            boardSize: result.gameState.size,
            solved: true,
            timeElapsed: stats.duration,
            moves: stats.moves,
            hints: 0, // Add hint tracking if needed
            score: this.calculateScore(result.gameState.size, stats.duration, stats.moves, 0)
          }
          
          OfflineGameLogic.saveGameProgress(result.gameState, currentUser.id)
          OfflineGameStore.saveGame(gameData)
          
          // Update user stats
          const users = OfflineAuth.getOfflineUsers()
          const userIndex = users.findIndex(u => u.id === currentUser.id)
          if (userIndex !== -1) {
            if (!users[userIndex].stats) {
              users[userIndex].stats = {
                gamesPlayed: 0,
                gamesWon: 0,
                totalTime: 0,
                bestTimes: {},
                streak: 0
              }
            }
            
            users[userIndex].stats.gamesPlayed += 1
            users[userIndex].stats.gamesWon += 1
            users[userIndex].stats.totalTime += stats.duration
            
            // Update best time for this board size
            const sizeKey = `${result.gameState.size}x${result.gameState.size}`
            if (!users[userIndex].stats.bestTimes[sizeKey] || 
                users[userIndex].stats.bestTimes[sizeKey] > stats.duration) {
              users[userIndex].stats.bestTimes[sizeKey] = stats.duration
            }
            
            localStorage.setItem(OfflineAuth.STORAGE_KEYS.USERS, JSON.stringify(users))
            localStorage.setItem(OfflineAuth.STORAGE_KEYS.CURRENT_USER, JSON.stringify(OfflineAuth.sanitizeUser(users[userIndex])))
          }
        }
        
        alert(`Congratulations! You solved the ${gameState.size}x${gameState.size} puzzle in ${stats.moves} moves and ${stats.duration} seconds!`)
      }
    } else {
      alert(result.message)
    }
  }

  const getHint = () => {
    if (!gameState) return
    
    const hint = OfflineGameLogic.getHint(gameState)
    setShowHint(hint)
    
    // Clear hint after 3 seconds
    setTimeout(() => setShowHint(null), 3000)
  }

  const resetGame = () => {
    startNewGame(selectedSize)
  }

  const calculateScore = (boardSize, timeElapsed, moves, hints) => {
    let score = 1000 // Base score
    score += Math.max(0, 500 - timeElapsed * 2) // Speed bonus
    score -= moves * 10 // Move penalty
    score -= hints * 100 // Hint penalty
    score += boardSize * 50 // Difficulty bonus
    return Math.max(100, Math.round(score)) // Minimum score of 100
  }

  const renderBoard = () => {
    if (!gameState) return null

    return (
      <div className="chess-board" data-size={gameState.size}>
        {gameState.board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isLight = (rowIndex + colIndex) % 2 === 0
            const hasQueen = cell === 1
            const isHinted = showHint && showHint.row === rowIndex && showHint.col === colIndex
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`chess-square ${isLight ? 'light' : 'dark'} ${isHinted ? 'hinted' : ''}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                style={{
                  backgroundColor: isHinted ? 'rgba(255, 215, 0, 0.3)' : undefined
                }}
              >
                {hasQueen && <span className="queen">♛</span>}
              </div>
            )
          })
        )}
      </div>
    )
  }

  const currentStats = gameState ? OfflineGameLogic.getGameStats(gameState) : null

  return (
    <Layout>
      <div className="board-container">
        <div className="board-wrapper">
        {/* Game Header with Back Button */}
        <div className="game-header">
          <div className="header-top">
            <button 
              className="back-button"
              onClick={() => navigate('/')}
              style={{
                backgroundColor: '#82966f',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              ← Back to Home
            </button>
          </div>
          <h1>N-Queens Game</h1>
          <p>Place {selectedSize} queens on the board so none can attack each other</p>
        </div>

        {/* Game Controls */}
        <div className="game-controls">
          <div className="control-group">
            <label>Board Size:</label>
            <select 
              value={selectedSize} 
              onChange={(e) => startNewGame(parseInt(e.target.value))}
              disabled={gameState && gameState.queens.length > 0}
            >
              <option value={4}>4x4 (Easy)</option>
              <option value={6}>6x6 (Medium)</option>
              <option value={8}>8x8 (Hard)</option>
              <option value={10}>10x10 (Expert)</option>
            </select>
          </div>

          <button className="control-btn" onClick={getHint}>
            💡 Hint
          </button>

          <button className="control-btn" onClick={resetGame}>
            🔄 Reset
          </button>
        </div>

        {/* Game Stats */}
        {currentStats && (
          <div className="move-counter">
            <div className="counter-item">
              <span className="number">{currentStats.queensPlaced}</span>
              <span className="label">Queens</span>
            </div>
            <div className="counter-item">
              <span className="number">{currentStats.moves}</span>
              <span className="label">Moves</span>
            </div>
            <div className="counter-item">
              <span className="number">{currentStats.duration}s</span>
              <span className="label">Time</span>
            </div>
          </div>
        )}

        {/* Game Board */}
        <div className="game-board">
          {renderBoard()}
        </div>

        {/* Hint Display */}
        {showHint && (
          <div className="game-status">
            <div className="status-message info">
              💡 {showHint.message}
            </div>
          </div>
        )}

        {/* Win Message */}
        {gameState && gameState.isComplete && (
          <div className="success-message">
            <h2>🎉 Puzzle Solved!</h2>
            <p>
              You completed the {gameState.size}x{gameState.size} puzzle in{' '}
              {gameStats?.moves} moves and {gameStats?.duration} seconds!
            </p>
            <div className="win-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="control-btn" onClick={() => startNewGame(selectedSize)}>
                🎮 Play Again
              </button>
              <button 
                className="control-btn" 
                onClick={() => navigate('/leaderboard')}
                style={{ backgroundColor: '#65a3be' }}
              >
                📊 View Scores
              </button>
              <button 
                className="control-btn" 
                onClick={() => navigate('/')}
                style={{ backgroundColor: '#82966f' }}
              >
                🏠 Home
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="game-instructions">
          <h3>How to Play:</h3>
          <p>
            • Tap empty squares to place queens<br/>
            • Tap queens to remove them<br/>
            • Queens cannot attack each other (same row, column, or diagonal)<br/>
            • Place all {selectedSize} queens to win!
          </p>
        </div>

        {/* Offline Mode Indicator */}
        {Capacitor.isNativePlatform() && (
          <div style={{ 
            textAlign: 'center', 
            padding: '10px', 
            backgroundColor: 'rgba(130, 150, 111, 0.1)',
            borderRadius: '8px',
            margin: '20px 0',
            fontSize: '14px'
          }}>
            📱 Playing in offline mode - Progress saved locally
          </div>
        )}
        </div>
      </div>
    </Layout>
  )
}

export default OfflineNQueensGame