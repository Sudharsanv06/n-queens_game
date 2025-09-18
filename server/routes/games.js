import express from 'express'
import Game from '../models/Game.js'
import User from '../models/User.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// Save game
router.post('/', verifyToken, async (req, res) => {
  const { mode, category, size, queens, time, moves, hints, solved } = req.body
  try {
    const newGame = new Game({ 
      userId: req.user.id, 
      mode, 
      category,
      size, 
      queens, 
      time, 
      moves, 
      hints, 
      solved 
    })
    await newGame.save()
    res.status(201).json({ message: 'Game saved successfully', score: newGame.score })
  } catch (err) {
    console.error('Save game error:', err)
    res.status(500).json({ error: 'Could not save game' })
  }
})

// Get user's games
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    // Ensure user can only access their own games unless they are requesting public data
    const userIdParam = req.params.userId
    if (userIdParam !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    const games = await Game.find({ userId: userIdParam })
      .sort({ createdAt: -1 })
      .limit(20)
    res.json(games)
  } catch (err) {
    console.error('Get user games error:', err)
    res.status(500).json({ error: 'Could not fetch games' })
  }
})

// Get leaderboard by category
router.get('/leaderboard/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const leaderboard = await Game.aggregate([
      { 
        $match: { 
          solved: true, 
          category: category 
        } 
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $group: {
          _id: '$userId',
          username: { $first: '$user.name' },
          totalGames: { $sum: 1 },
          avgScore: { $avg: '$score' },
          bestScore: { $max: '$score' },
          totalTime: { $sum: '$time' },
          avgTime: { $avg: '$time' }
        }
      },
      { $sort: { bestScore: -1, avgScore: -1 } },
      { $limit: 20 }
    ])
    res.json(leaderboard)
  } catch (err) {
    console.error('Leaderboard error:', err)
    res.status(500).json({ error: 'Could not fetch leaderboard' })
  }
})

// Get global leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Game.aggregate([
      { $match: { solved: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $group: {
          _id: '$userId',
          username: { $first: '$user.name' },
          totalGames: { $sum: 1 },
          avgScore: { $avg: '$score' },
          bestScore: { $max: '$score' },
          totalTime: { $sum: '$time' },
          avgTime: { $avg: '$time' }
        }
      },
      { $sort: { bestScore: -1, avgScore: -1 } },
      { $limit: 20 }
    ])
    res.json(leaderboard)
  } catch (err) {
    console.error('Leaderboard error:', err)
    res.status(500).json({ error: 'Could not fetch leaderboard' })
  }
})

// Get recent games
router.get('/recent', async (req, res) => {
  try {
    const recentGames = await Game.find({ solved: true })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
    res.json(recentGames)
  } catch (err) {
    console.error('Recent games error:', err)
    res.status(500).json({ error: 'Could not fetch recent games' })
  }
})

export default router
