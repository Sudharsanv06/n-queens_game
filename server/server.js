import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import gameRoutes from './routes/games.js'
import dailyChallengeRoutes from './routes/dailyChallenges.js'
import multiplayerRoutes from './routes/multiplayer.js'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

dotenv.config()
const app = express()

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/games', gameRoutes)
app.use('/api/daily-challenges', dailyChallengeRoutes)
app.use('/api/multiplayer', multiplayerRoutes)

const PORT = process.env.PORT || 5000

// Create HTTP server and attach Socket.IO
const httpServer = createServer(app)
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})

// Basic multiplayer namespace/rooms for N-Queens
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id)

  socket.on('join_room', (roomId) => {
    socket.join(roomId)
    socket.to(roomId).emit('player_joined', { id: socket.id })
  })

  socket.on('make_move', ({ roomId, move }) => {
    // Broadcast move to other players in the room
    socket.to(roomId).emit('opponent_move', move)
  })

  socket.on('chat_message', ({ roomId, message }) => {
    socket.to(roomId).emit('chat_message', { from: socket.id, message })
  })

  socket.on('leave_room', (roomId) => {
    socket.leave(roomId)
    socket.to(roomId).emit('player_left', { id: socket.id })
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id)
  })
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    httpServer.listen(PORT, () => console.log(`Server + WebSocket running on port ${PORT}`))
  })
  .catch(err => console.log(err))
