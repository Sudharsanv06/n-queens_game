import express from 'express'
import MultiplayerRoom from '../models/MultiplayerRoom.js'
import User from '../models/User.js'
import { verifyToken } from '../middleware/auth.js'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Create a new multiplayer room
router.post('/rooms', verifyToken, async (req, res) => {
  try {
    const { gameMode, boardSize, maxPlayers, isPrivate, password } = req.body
    const userId = req.user.id
    
    const roomId = uuidv4().substring(0, 8).toUpperCase()
    
    const room = new MultiplayerRoom({
      roomId,
      gameMode: gameMode || 'fastest-solve',
      boardSize: boardSize || 8,
      maxPlayers: maxPlayers || 2,
      isPrivate: isPrivate || false,
      password: password || null,
      players: [{
        userId,
        isReady: false
      }]
    })
    
    await room.save()
    await room.populate('players.userId', 'name')
    
    res.status(201).json({
      message: 'Room created successfully',
      room
    })
  } catch (err) {
    console.error('Create room error:', err)
    res.status(500).json({ error: 'Could not create room' })
  }
})

// Join a multiplayer room
router.post('/rooms/:roomId/join', verifyToken, async (req, res) => {
  try {
    const { roomId } = req.params
    const { password } = req.body
    const userId = req.user.id
    
    const room = await MultiplayerRoom.findOne({ roomId })
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' })
    }
    
    if (room.gameState !== 'waiting') {
      return res.status(400).json({ message: 'Room is not accepting new players' })
    }
    
    if (room.players.length >= room.maxPlayers) {
      return res.status(400).json({ message: 'Room is full' })
    }
    
    if (room.isPrivate && room.password !== password) {
      return res.status(401).json({ message: 'Incorrect room password' })
    }
    
    // Check if user is already in the room
    const existingPlayer = room.players.find(p => p.userId.toString() === userId)
    if (existingPlayer) {
      return res.status(400).json({ message: 'Already in this room' })
    }
    
    room.players.push({
      userId,
      isReady: false
    })
    
    await room.save()
    await room.populate('players.userId', 'name')
    
    res.json({
      message: 'Joined room successfully',
      room
    })
  } catch (err) {
    console.error('Join room error:', err)
    res.status(500).json({ error: 'Could not join room' })
  }
})

// Leave a multiplayer room
router.post('/rooms/:roomId/leave', verifyToken, async (req, res) => {
  try {
    const { roomId } = req.params
    const userId = req.user.id
    
    const room = await MultiplayerRoom.findOne({ roomId })
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' })
    }
    
    room.players = room.players.filter(p => p.userId.toString() !== userId)
    
    // If no players left, mark room as abandoned
    if (room.players.length === 0) {
      room.gameState = 'abandoned'
    }
    
    await room.save()
    
    res.json({ message: 'Left room successfully' })
  } catch (err) {
    console.error('Leave room error:', err)
    res.status(500).json({ error: 'Could not leave room' })
  }
})

// Set player ready status
router.post('/rooms/:roomId/ready', verifyToken, async (req, res) => {
  try {
    const { roomId } = req.params
    const { isReady } = req.body
    const userId = req.user.id
    
    const room = await MultiplayerRoom.findOne({ roomId })
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' })
    }
    
    const player = room.players.find(p => p.userId.toString() === userId)
    if (!player) {
      return res.status(404).json({ message: 'Player not in room' })
    }
    
    player.isReady = isReady
    
    // Check if all players are ready
    const allReady = room.players.every(p => p.isReady)
    if (allReady && room.players.length >= 2) {
      room.gameState = 'ready'
    } else {
      room.gameState = 'waiting'
    }
    
    await room.save()
    await room.populate('players.userId', 'name')
    
    res.json({
      message: 'Ready status updated',
      room
    })
  } catch (err) {
    console.error('Set ready error:', err)
    res.status(500).json({ error: 'Could not update ready status' })
  }
})

// Start multiplayer game
router.post('/rooms/:roomId/start', verifyToken, async (req, res) => {
  try {
    const { roomId } = req.params
    const userId = req.user.id
    
    const room = await MultiplayerRoom.findOne({ roomId })
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' })
    }
    
    if (room.gameState !== 'ready') {
      return res.status(400).json({ message: 'Room is not ready to start' })
    }
    
    // Only room creator can start the game
    if (room.players[0].userId.toString() !== userId) {
      return res.status(403).json({ message: 'Only room creator can start the game' })
    }
    
    room.gameState = 'in-progress'
    room.startedAt = new Date()
    
    await room.save()
    await room.populate('players.userId', 'name')
    
    res.json({
      message: 'Game started successfully',
      room
    })
  } catch (err) {
    console.error('Start game error:', err)
    res.status(500).json({ error: 'Could not start game' })
  }
})

// Get available public rooms
router.get('/rooms', async (req, res) => {
  try {
    const { gameMode, boardSize } = req.query
    
    const filter = {
      isPrivate: false,
      gameState: 'waiting'
    }
    
    if (gameMode) filter.gameMode = gameMode
    if (boardSize) filter.boardSize = parseInt(boardSize)
    
    const rooms = await MultiplayerRoom.find(filter)
      .populate('players.userId', 'name level rank')
      .sort({ createdAt: -1 })
      .limit(20)
    
    res.json(rooms)
  } catch (err) {
    console.error('Get rooms error:', err)
    res.status(500).json({ error: 'Could not fetch rooms' })
  }
})

// Get room details
router.get('/rooms/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params
    
    const room = await MultiplayerRoom.findOne({ roomId })
      .populate('players.userId', 'name level rank')
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' })
    }
    
    res.json(room)
  } catch (err) {
    console.error('Get room error:', err)
    res.status(500).json({ error: 'Could not fetch room' })
  }
})

// Complete multiplayer game
router.post('/rooms/:roomId/complete', verifyToken, async (req, res) => {
  try {
    const { roomId } = req.params
    const { time, moves, hints, solved } = req.body
    const userId = req.user.id
    
    const room = await MultiplayerRoom.findOne({ roomId })
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' })
    }
    
    const player = room.players.find(p => p.userId.toString() === userId)
    if (!player) {
      return res.status(404).json({ message: 'Player not in room' })
    }
    
    if (player.completed) {
      return res.status(400).json({ message: 'Already completed' })
    }
    
    // Calculate score
    let score = 0
    if (solved) {
      score = 1000
      const timeBonus = Math.max(0, 500 - Math.floor(time / 10))
      const movePenalty = Math.min(200, moves * 10)
      const hintPenalty = hints * 100
      score = score + timeBonus - movePenalty - hintPenalty
    }
    
    player.completed = true
    player.completedAt = new Date()
    player.time = time
    player.moves = moves
    player.score = score
    
    // Check if this is the first completion (winner)
    const completedPlayers = room.players.filter(p => p.completed)
    if (completedPlayers.length === 1 && solved) {
      room.winner = userId
    }
    
    // Check if all players completed
    if (completedPlayers.length === room.players.length) {
      room.gameState = 'completed'
      room.completedAt = new Date()
    }
    
    await room.save()
    
    // Update user stats
    const user = await User.findById(userId)
    user.stats.multiplayerGames += 1
    if (room.winner && room.winner.toString() === userId) {
      user.stats.multiplayerWins += 1
    }
    user.stats.totalScore += score
    user.addExperience(score / 10)
    user.updateRank()
    
    await user.save()
    
    res.json({
      message: 'Game completed',
      score,
      isWinner: room.winner && room.winner.toString() === userId,
      room
    })
  } catch (err) {
    console.error('Complete multiplayer game error:', err)
    res.status(500).json({ error: 'Could not complete game' })
  }
})

export default router
