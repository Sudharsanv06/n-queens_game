import mongoose from 'mongoose'

const multiplayerRoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  gameMode: {
    type: String,
    required: true,
    enum: ['fastest-solve', 'turn-based', 'collaborative']
  },
  boardSize: {
    type: Number,
    required: true,
    min: 4,
    max: 12
  },
  maxPlayers: {
    type: Number,
    default: 2,
    min: 2,
    max: 4
  },
  players: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    socketId: String,
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isReady: {
      type: Boolean,
      default: false
    },
    currentBoard: [[Number]], // Current queen positions
    moves: {
      type: Number,
      default: 0
    },
    time: {
      type: Number,
      default: 0
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    score: {
      type: Number,
      default: 0
    }
  }],
  gameState: {
    type: String,
    enum: ['waiting', 'ready', 'in-progress', 'completed', 'abandoned'],
    default: 'waiting'
  },
  startedAt: Date,
  completedAt: Date,
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  password: String
}, { timestamps: true })

// Indexes for efficient queries
multiplayerRoomSchema.index({ roomId: 1 })
multiplayerRoomSchema.index({ gameState: 1 })
multiplayerRoomSchema.index({ 'players.userId': 1 })

export default mongoose.model('MultiplayerRoom', multiplayerRoomSchema)
