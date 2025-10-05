import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'
import authRoutes from './routes/auth.js'
import gameRoutes from './routes/games.js'
import dailyChallengeRoutes from './routes/dailyChallenges.js'
import multiplayerRoutes from './routes/multiplayer.js'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configure dotenv to load from current directory or parent
dotenv.config({ path: join(__dirname, '.env') })

// Debug environment variables
console.log('Environment loaded:', {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || '5000',
  MONGO_URI: process.env.MONGO_URI ? 'Set' : 'Not set',
  JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set'
})

const app = express()

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}))

// Compression middleware
app.use(compression())

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'))
}

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
})
app.use('/api/', limiter)

// Support multiple origins via comma-separated CLIENT_ORIGIN
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map(o => o.trim())

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser clients (e.g., curl/postman) and same-origin
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    // Allow mobile app (capacitor://) and local network IPs
    if (origin && (origin.startsWith('capacitor://') || origin.startsWith('http://10.') || origin.startsWith('http://192.'))) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Database connection middleware
const checkDatabaseConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      message: 'Database connection unavailable',
      error: 'Service temporarily unavailable. Please try again later.'
    })
  }
  next()
}

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    database: dbStatus,
    uptime: process.uptime()
  })
})

// API routes (with database connection check for auth routes)
app.use('/api/auth', checkDatabaseConnection, authRoutes)
app.use('/api/games', checkDatabaseConnection, gameRoutes)
app.use('/api/daily-challenges', checkDatabaseConnection, dailyChallengeRoutes)
app.use('/api/multiplayer', checkDatabaseConnection, multiplayerRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  })
})

const PORT = process.env.PORT || 5000

// Create HTTP server and attach Socket.IO
const httpServer = createServer(app)
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      return callback(new Error('Not allowed by CORS'))
    },
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
})

// Enhanced multiplayer system for N-Queens
const waitingPlayers = new Map() // Players waiting for match
const activeRooms = new Map() // Active game rooms
const privateRooms = new Map() // Private room codes

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id)

  // Join random match
  socket.on('join_random_match', (data) => {
    const { playerId, playerName, preferences } = data
    
    // Find compatible waiting player
    let matchFound = false
    for (const [waitingSocketId, waitingData] of waitingPlayers.entries()) {
      if (waitingData.preferences.boardSize === preferences.boardSize &&
          waitingData.preferences.mode === preferences.mode &&
          waitingSocketId !== socket.id) {
        
        // Create game room
        const roomId = generateRoomCode()
        const gameSettings = {
          size: preferences.boardSize,
          timeLimit: preferences.timeLimit,
          mode: preferences.mode
        }
        
        // Move both players to room
        socket.join(roomId)
        io.sockets.sockets.get(waitingSocketId)?.join(roomId)
        
        // Create room data
        activeRooms.set(roomId, {
          players: [
            { id: playerId, name: playerName, socketId: socket.id },
            { id: waitingData.playerId, name: waitingData.playerName, socketId: waitingSocketId }
          ],
          settings: gameSettings,
          status: 'playing',
          startedAt: Date.now()
        })
        
        // Notify both players
        io.to(roomId).emit('room_joined', {
          roomId,
          players: activeRooms.get(roomId).players,
          settings: gameSettings
        })
        
        // Start game immediately
        setTimeout(() => {
          io.to(roomId).emit('game_started', {
            settings: gameSettings,
            startTime: Date.now()
          })
        }, 2000)
        
        waitingPlayers.delete(waitingSocketId)
        matchFound = true
        break
      }
    }
    
    if (!matchFound) {
      // Add to waiting list
      waitingPlayers.set(socket.id, { playerId, playerName, preferences })
      socket.emit('waiting_for_match', { message: 'Searching for opponent...' })
    }
  })

  // Create private room
  socket.on('create_private_room', (data) => {
    const { playerId, playerName, settings } = data
    const roomCode = generateRoomCode()
    
    socket.join(roomCode)
    
    privateRooms.set(roomCode, {
      host: { id: playerId, name: playerName, socketId: socket.id },
      players: [{ id: playerId, name: playerName, socketId: socket.id }],
      settings,
      status: 'waiting',
      createdAt: Date.now()
    })
    
    socket.emit('room_created', { roomCode, roomId: roomCode })
    socket.emit('room_joined', {
      roomId: roomCode,
      players: privateRooms.get(roomCode).players,
      settings
    })
  })

  // Join private room
  socket.on('join_private_room', (data) => {
    const { roomCode, playerId, playerName } = data
    
    if (!privateRooms.has(roomCode)) {
      socket.emit('connection_error', { message: 'Room not found' })
      return
    }
    
    const room = privateRooms.get(roomCode)
    if (room.status !== 'waiting') {
      socket.emit('connection_error', { message: 'Game already in progress' })
      return
    }
    
    if (room.players.length >= 4) {
      socket.emit('connection_error', { message: 'Room is full' })
      return
    }
    
    // Add player to room
    const newPlayer = { id: playerId, name: playerName, socketId: socket.id }
    room.players.push(newPlayer)
    socket.join(roomCode)
    
    // Notify all players
    io.to(roomCode).emit('player_joined', { player: newPlayer })
    socket.emit('room_joined', {
      roomId: roomCode,
      players: room.players,
      settings: room.settings
    })
    
    // Auto-start when 2+ players
    if (room.players.length >= 2) {
      room.status = 'playing'
      room.startedAt = Date.now()
      
      activeRooms.set(roomCode, room)
      privateRooms.delete(roomCode)
      
      setTimeout(() => {
        io.to(roomCode).emit('game_started', {
          settings: room.settings,
          startTime: Date.now()
        })
      }, 3000)
    }
  })

  // Handle game moves
  socket.on('make_move', (data) => {
    const { roomId, playerId, playerName, queens, moves, solved } = data
    
    // Broadcast to other players in room
    socket.to(roomId).emit('opponent_move', {
      playerId,
      playerName,
      queens,
      moves,
      solved
    })
    
    // Check if game is won
    if (solved) {
      const room = activeRooms.get(roomId)
      if (room) {
        room.status = 'finished'
        room.winner = { id: playerId, name: playerName }
        room.finishedAt = Date.now()
        
        io.to(roomId).emit('game_finished', {
          winner: playerId,
          winnerName: playerName,
          duration: room.finishedAt - room.startedAt
        })
      }
    }
  })

  // Handle chat messages
  socket.on('chat_message', (data) => {
    const { roomId, message } = data
    
    // Find player info
    let playerName = 'Unknown'
    const room = activeRooms.get(roomId) || privateRooms.get(roomId)
    if (room) {
      const player = room.players.find(p => p.socketId === socket.id)
      if (player) playerName = player.name
    }
    
    socket.to(roomId).emit('chat_message', {
      from: socket.id,
      playerName,
      message,
      timestamp: Date.now()
    })
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id)
    
    // Remove from waiting players
    waitingPlayers.delete(socket.id)
    
    // Handle room disconnections
    for (const [roomId, room] of activeRooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.socketId === socket.id)
      if (playerIndex !== -1) {
        const disconnectedPlayer = room.players[playerIndex]
        room.players.splice(playerIndex, 1)
        
        socket.to(roomId).emit('player_left', { 
          playerId: disconnectedPlayer.id,
          playerName: disconnectedPlayer.name
        })
        
        // End game if no players left or declare remaining player winner
        if (room.players.length === 0) {
          activeRooms.delete(roomId)
        } else if (room.players.length === 1 && room.status === 'playing') {
          const winner = room.players[0]
          io.to(roomId).emit('game_finished', {
            winner: winner.id,
            winnerName: winner.name,
            reason: 'opponent_disconnected'
          })
          activeRooms.delete(roomId)
        }
        break
      }
    }
    
    // Handle private room disconnections
    for (const [roomCode, room] of privateRooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.socketId === socket.id)
      if (playerIndex !== -1) {
        const disconnectedPlayer = room.players[playerIndex]
        room.players.splice(playerIndex, 1)
        
        socket.to(roomCode).emit('player_left', { 
          playerId: disconnectedPlayer.id,
          playerName: disconnectedPlayer.name
        })
        
        if (room.players.length === 0) {
          privateRooms.delete(roomCode)
        }
        break
      }
    }
  })
})

// Clean up old rooms periodically
setInterval(() => {
  const now = Date.now()
  const maxAge = 30 * 60 * 1000 // 30 minutes
  
  for (const [roomId, room] of activeRooms.entries()) {
    if (now - room.startedAt > maxAge) {
      activeRooms.delete(roomId)
      console.log(`Cleaned up old room: ${roomId}`)
    }
  }
  
  for (const [roomCode, room] of privateRooms.entries()) {
    if (now - room.createdAt > maxAge) {
      privateRooms.delete(roomCode)
      console.log(`Cleaned up old private room: ${roomCode}`)
    }
  }
}, 5 * 60 * 1000) // Check every 5 minutes

// Database connection configuration
const mongoOptions = {
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  maxPoolSize: 10, // Maintain up to 10 socket connections
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  retryWrites: true, // Retry write operations on failure
  retryReads: true, // Retry read operations on failure
  family: 4 // Use IPv4, skip trying IPv6
}

// Database connection and server startup
console.log('Attempting to connect to MongoDB...')
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/n-queens-game'
console.log('MongoDB URI:', MONGO_URI.replace(/\/\/.*@/, '//***:***@'))

mongoose.connect(MONGO_URI, mongoOptions)
  .then(() => {
    console.log('✅ MongoDB connected successfully')
    
    // Start the server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`🔗 WebSocket server ready`)
      console.log(`💾 Database: Connected`)
      console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET ? 'Set' : 'Using default (change in production)'}`)
      console.log(`📧 CORS Origins: ${process.env.CLIENT_ORIGIN}`)
    })
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message)
    console.error('Database connection failed. Please ensure MongoDB is running.')
    console.log('Trying to start server without database connection...')
    
    // Start server even without DB for development
    if (process.env.NODE_ENV === 'development') {
      httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT} (WITHOUT DATABASE)`)
        console.log(`⚠️  Database connection failed - some features may not work`)
      })
    } else {
      process.exit(1)
    }
  })

// Handle mongoose connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB')
})

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB')
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...')
  httpServer.close(() => {
    mongoose.connection.close(() => {
      console.log('Server closed. Database connection terminated.')
      process.exit(0)
    })
  })
})
