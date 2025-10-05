import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { 
  Users, 
  Trophy, 
  Clock, 
  Crown, 
  Wifi, 
  WifiOff, 
  MessageCircle,
  Send,
  Volume2,
  VolumeX
} from 'lucide-react'
import io from 'socket.io-client'
import { MobileUtils } from '../utils/mobile'
import { connectSocket, sendMove, sendChatMessage } from '../store/slices/multiplayerSlice'
import toast from 'react-hot-toast'
import Layout from './Layout'

const MultiplayerGame = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [socket, setSocket] = useState(null)
  const [gameRoom, setGameRoom] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [opponents, setOpponents] = useState([])
  const [gameState, setGameState] = useState('waiting') // waiting, playing, finished
  
  // Game specific states
  const [board, setBoard] = useState([])
  const [queens, setQueens] = useState([])
  const [opponentQueens, setOpponentQueens] = useState({})
  const [gameStartTime, setGameStartTime] = useState(null)
  const [moves, setMoves] = useState(0)
  const [isWinner, setIsWinner] = useState(false)
  const [gameSettings, setGameSettings] = useState({
    size: 8,
    timeLimit: 300, // 5 minutes
    mode: 'race' // race, turn-based
  })
  
  // UI states
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const chatInputRef = useRef(null)

  // Initialize socket connection
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    const newSocket = io(socketUrl)
    
    newSocket.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)
      setSocket(newSocket)
    })
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setIsConnected(false)
    })
    
    // Game events
    newSocket.on('room_joined', handleRoomJoined)
    newSocket.on('player_joined', handlePlayerJoined)
    newSocket.on('player_left', handlePlayerLeft)
    newSocket.on('game_started', handleGameStarted)
    newSocket.on('opponent_move', handleOpponentMove)
    newSocket.on('game_finished', handleGameFinished)
    newSocket.on('chat_message', handleChatMessage)
    newSocket.on('connection_error', handleConnectionError)
    
    return () => {
      newSocket.close()
    }
  }, [])

  // Initialize game board
  useEffect(() => {
    if (gameSettings.size) {
      const newBoard = Array(gameSettings.size).fill(null).map(() => 
        Array(gameSettings.size).fill(null)
      )
      setBoard(newBoard)
      setQueens([])
      setMoves(0)
    }
  }, [gameSettings.size])

  const handleRoomJoined = (data) => {
    setGameRoom(data.roomId)
    setOpponents(data.players.filter(p => p.id !== user._id))
    toast.success('Joined multiplayer game!')
  }

  const handlePlayerJoined = (data) => {
    setOpponents(prev => [...prev, data.player])
    toast.success(`${data.player.name} joined the game!`)
    playSound('player-join')
  }

  const handlePlayerLeft = (data) => {
    setOpponents(prev => prev.filter(p => p.id !== data.playerId))
    toast.error(`Player left the game`)
    playSound('player-leave')
  }

  const handleGameStarted = (data) => {
    setGameState('playing')
    setGameSettings(data.settings)
    setGameStartTime(Date.now())
    toast.success('Game started! Race to solve the N-Queens puzzle!')
    playSound('game-start')
  }

  const handleOpponentMove = (data) => {
    setOpponentQueens(prev => ({
      ...prev,
      [data.playerId]: data.queens
    }))
    
    // Check if opponent won
    if (data.queens.length === gameSettings.size && data.solved) {
      handleGameFinished({ winner: data.playerId, winnerName: data.playerName })
    }
    
    playSound('move')
  }

  const handleGameFinished = (data) => {
    setGameState('finished')
    if (data.winner === user._id) {
      setIsWinner(true)
      toast.success('🎉 You won!')
      MobileUtils.triggerHapticFeedback('Heavy')
      playSound('victory')
    } else {
      setIsWinner(false)
      toast.error(`${data.winnerName} won!`)
      playSound('defeat')
    }
  }

  const handleChatMessage = (data) => {
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      playerId: data.from,
      playerName: data.playerName,
      message: data.message,
      timestamp: new Date()
    }])
    playSound('message')
  }

  const handleConnectionError = (error) => {
    toast.error(`Connection error: ${error.message}`)
  }

  const playSound = (soundType) => {
    if (!soundEnabled) return
    
    const sounds = {
      'move': '/sounds/move.mp3',
      'victory': '/sounds/victory.mp3',
      'defeat': '/sounds/defeat.mp3',
      'game-start': '/sounds/game-start.mp3',
      'player-join': '/sounds/join.mp3',
      'player-leave': '/sounds/leave.mp3',
      'message': '/sounds/message.mp3'
    }
    
    const audio = new Audio(sounds[soundType])
    audio.volume = 0.3
    audio.play().catch(console.error)
  }

  const joinRandomMatch = () => {
    if (socket && user) {
      socket.emit('join_random_match', {
        playerId: user._id,
        playerName: user.name,
        preferences: {
          boardSize: gameSettings.size,
          timeLimit: gameSettings.timeLimit,
          mode: gameSettings.mode
        }
      })
    }
  }

  const createPrivateRoom = () => {
    if (socket && user) {
      socket.emit('create_private_room', {
        playerId: user._id,
        playerName: user.name,
        settings: gameSettings
      })
    }
  }

  const joinPrivateRoom = (roomCode) => {
    if (socket && user) {
      socket.emit('join_private_room', {
        roomCode,
        playerId: user._id,
        playerName: user.name
      })
    }
  }

  const makeMove = (row, col) => {
    if (gameState !== 'playing') return
    
    const existingQueenIndex = queens.findIndex(q => q.row === row && q.col === col)
    let newQueens
    
    if (existingQueenIndex !== -1) {
      // Remove queen
      newQueens = queens.filter((_, index) => index !== existingQueenIndex)
    } else {
      // Add queen if safe
      if (isSafe(row, col, queens)) {
        newQueens = [...queens, { row, col }]
      } else {
        toast.error('Invalid move!')
        MobileUtils.triggerHapticFeedback('Heavy')
        return
      }
    }
    
    setQueens(newQueens)
    setMoves(moves + 1)
    
    // Emit move to other players
    if (socket && gameRoom) {
      socket.emit('make_move', {
        roomId: gameRoom,
        playerId: user._id,
        playerName: user.name,
        queens: newQueens,
        moves: moves + 1,
        solved: newQueens.length === gameSettings.size
      })
    }
    
    // Check if won locally
    if (newQueens.length === gameSettings.size) {
      handleGameFinished({ winner: user._id, winnerName: user.name })
    }
    
    MobileUtils.triggerHapticFeedback('Light')
  }

  const isSafe = (row, col, currentQueens) => {
    for (const queen of currentQueens) {
      if (queen.row === row || 
          queen.col === col || 
          Math.abs(queen.row - row) === Math.abs(queen.col - col)) {
        return false
      }
    }
    return true
  }

  const sendChatMessage = () => {
    if (!newMessage.trim() || !socket || !gameRoom) return
    
    socket.emit('chat_message', {
      roomId: gameRoom,
      message: newMessage.trim()
    })
    
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      playerId: user._id,
      playerName: user.name,
      message: newMessage.trim(),
      timestamp: new Date(),
      isOwn: true
    }])
    
    setNewMessage('')
  }

  const getGameTime = () => {
    if (!gameStartTime) return 0
    return Math.floor((Date.now() - gameStartTime) / 1000)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isConnected) {
    return (
      <Layout>
        <div className="multiplayer-loading">
          <WifiOff size={48} />
          <h2>Connecting to multiplayer server...</h2>
          <p>Please check your internet connection</p>
        </div>
      </Layout>
    )
  }

  if (gameState === 'waiting') {
    return (
      <Layout>
        <div className="multiplayer-lobby">
          <motion.div 
            className="lobby-header"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1>
              <Users className="header-icon" />
              Multiplayer N-Queens
            </h1>
            <div className="connection-status">
              <Wifi className="wifi-icon" />
              <span>Connected</span>
            </div>
          </motion.div>

          <motion.div 
            className="game-settings"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2>Game Settings</h2>
            
            <div className="setting-group">
              <label>Board Size</label>
              <select 
                value={gameSettings.size}
                onChange={(e) => setGameSettings(prev => ({
                  ...prev, 
                  size: parseInt(e.target.value)
                }))}
              >
                <option value={6}>6×6 (Easy)</option>
                <option value={8}>8×8 (Medium)</option>
                <option value={10}>10×10 (Hard)</option>
                <option value={12}>12×12 (Expert)</option>
              </select>
            </div>

            <div className="setting-group">
              <label>Time Limit</label>
              <select 
                value={gameSettings.timeLimit}
                onChange={(e) => setGameSettings(prev => ({
                  ...prev, 
                  timeLimit: parseInt(e.target.value)
                }))}
              >
                <option value={180}>3 minutes</option>
                <option value={300}>5 minutes</option>
                <option value={600}>10 minutes</option>
                <option value={0}>No limit</option>
              </select>
            </div>

            <div className="setting-group">
              <label>Game Mode</label>
              <select 
                value={gameSettings.mode}
                onChange={(e) => setGameSettings(prev => ({
                  ...prev, 
                  mode: e.target.value
                }))}
              >
                <option value="race">Speed Race</option>
                <option value="turn-based">Turn Based</option>
              </select>
            </div>
          </motion.div>

          <motion.div 
            className="lobby-actions"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <button 
              className="join-random-btn"
              onClick={joinRandomMatch}
            >
              <Trophy className="btn-icon" />
              Join Random Match
            </button>

            <button 
              className="create-room-btn"
              onClick={createPrivateRoom}
            >
              <Crown className="btn-icon" />
              Create Private Room
            </button>

            <div className="private-room-input">
              <input 
                type="text" 
                placeholder="Enter room code"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    joinPrivateRoom(e.target.value)
                  }
                }}
              />
              <button onClick={() => {
                const input = document.querySelector('.private-room-input input')
                joinPrivateRoom(input.value)
              }}>
                Join
              </button>
            </div>
          </motion.div>

          {gameRoom && (
            <motion.div 
              className="room-info"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <h3>Room: {gameRoom}</h3>
              <div className="players-list">
                <div className="player you">
                  <span>{user.name} (You)</span>
                  <span className="ready">Ready</span>
                </div>
                {opponents.map(opponent => (
                  <div key={opponent.id} className="player">
                    <span>{opponent.name}</span>
                    <span className="ready">Ready</span>
                  </div>
                ))}
              </div>
              <p>Waiting for more players...</p>
            </motion.div>
          )}
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="multiplayer-game">
        {/* Header */}
        <div className="game-header-multi">
          <div className="header-left">
            <h2>{gameSettings.size}×{gameSettings.size} Race</h2>
            <div className="game-timer">
              <Clock size={16} />
              <span>{formatTime(getGameTime())}</span>
            </div>
          </div>
          
          <div className="header-right">
            <button 
              className="sound-toggle"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            
            <button 
              className="chat-toggle"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageCircle size={20} />
              {chatMessages.filter(m => !m.isOwn).length > 0 && (
                <span className="chat-badge">{chatMessages.filter(m => !m.isOwn).length}</span>
              )}
            </button>
          </div>
        </div>

        <div className="game-content">
          {/* Players Panel */}
          <div className="players-panel">
            <div className={`player-card ${isWinner ? 'winner' : ''}`}>
              <div className="player-info">
                <span className="player-name">{user.name} (You)</span>
                <div className="player-stats">
                  <span>Queens: {queens.length}/{gameSettings.size}</span>
                  <span>Moves: {moves}</span>
                </div>
              </div>
              {gameState === 'finished' && isWinner && (
                <Trophy className="winner-trophy" />
              )}
            </div>

            {opponents.map(opponent => {
              const opponentQueenCount = opponentQueens[opponent.id]?.length || 0
              return (
                <div key={opponent.id} className="player-card">
                  <div className="player-info">
                    <span className="player-name">{opponent.name}</span>
                    <div className="player-stats">
                      <span>Queens: {opponentQueenCount}/{gameSettings.size}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Game Board */}
          <div className="board-section">
            <div 
              className="chess-board-multi"
              style={{
                gridTemplateColumns: `repeat(${gameSettings.size}, 1fr)`,
                gridTemplateRows: `repeat(${gameSettings.size}, 1fr)`,
              }}
            >
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const hasQueen = queens.some(q => q.row === rowIndex && q.col === colIndex)
                  const isLight = (rowIndex + colIndex) % 2 === 0
                  
                  return (
                    <motion.div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        chess-square-multi 
                        ${isLight ? 'light' : 'dark'}
                        ${hasQueen ? 'has-queen' : ''}
                      `}
                      onClick={() => makeMove(rowIndex, colIndex)}
                      whileTap={{ scale: 0.95 }}
                      animate={hasQueen ? { scale: [0.9, 1.1, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <AnimatePresence>
                        {hasQueen && (
                          <motion.span
                            className="queen-multi"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                          >
                            ♛
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              className="chat-panel"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
            >
              <div className="chat-header">
                <h3>Game Chat</h3>
                <button onClick={() => setShowChat(false)}>×</button>
              </div>
              
              <div className="chat-messages">
                {chatMessages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`chat-message ${msg.isOwn ? 'own' : ''}`}
                  >
                    <span className="sender">{msg.playerName}</span>
                    <span className="message">{msg.message}</span>
                  </div>
                ))}
              </div>
              
              <div className="chat-input">
                <input
                  ref={chatInputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Type a message..."
                  maxLength={100}
                />
                <button onClick={sendChatMessage}>
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Result Modal */}
        <AnimatePresence>
          {gameState === 'finished' && (
            <motion.div
              className="result-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="result-modal-multi"
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
              >
                <div className="result-header">
                  <h2>
                    {isWinner ? '🏆 Victory!' : '😔 Defeat'}
                  </h2>
                  <p>
                    {isWinner 
                      ? 'Congratulations! You solved it first!' 
                      : 'Better luck next time!'
                    }
                  </p>
                </div>

                <div className="final-stats">
                  <div className="stat">
                    <span>Time:</span>
                    <span>{formatTime(getGameTime())}</span>
                  </div>
                  <div className="stat">
                    <span>Moves:</span>
                    <span>{moves}</span>
                  </div>
                  <div className="stat">
                    <span>Queens:</span>
                    <span>{queens.length}/{gameSettings.size}</span>
                  </div>
                </div>

                <div className="result-actions">
                  <button onClick={joinRandomMatch}>
                    Play Again
                  </button>
                  <button onClick={() => window.location.href = '/'}>
                    Back to Home
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  )
}

export default MultiplayerGame