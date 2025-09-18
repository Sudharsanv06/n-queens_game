import express from 'express'
import DailyChallenge from '../models/DailyChallenge.js'
import User from '../models/User.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// Get today's daily challenge
router.get('/today', async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let challenge = await DailyChallenge.findOne({ 
      date: today,
      isActive: true 
    })
    
    // If no challenge exists for today, create one
    if (!challenge) {
      challenge = await createDailyChallenge(today)
    }
    
    res.json(challenge)
  } catch (err) {
    console.error('Get daily challenge error:', err)
    res.status(500).json({ error: 'Could not fetch daily challenge' })
  }
})

// Submit daily challenge completion
router.post('/complete', verifyToken, async (req, res) => {
  try {
    const { time, moves, hints, solved } = req.body
    const userId = req.user.id
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const challenge = await DailyChallenge.findOne({ 
      date: today,
      isActive: true 
    })
    
    if (!challenge) {
      return res.status(404).json({ message: 'No active daily challenge found' })
    }
    
    // Check if user already completed today's challenge
    const existingCompletion = challenge.completions.find(
      completion => completion.userId.toString() === userId
    )
    
    if (existingCompletion) {
      return res.status(400).json({ message: 'Daily challenge already completed' })
    }
    
    if (!solved) {
      return res.status(400).json({ message: 'Challenge must be solved to submit' })
    }
    
    // Calculate score
    let score = challenge.points
    const timeBonus = Math.max(0, 500 - Math.floor(time / 10))
    const movePenalty = Math.min(200, moves * 5)
    const hintPenalty = hints * 50
    
    score = score + timeBonus - movePenalty - hintPenalty
    
    // Add completion to challenge
    challenge.completions.push({
      userId,
      time,
      moves,
      hints,
      score
    })
    
    await challenge.save()
    
    // Update user stats
    const user = await User.findById(userId)
    user.stats.dailyChallengesCompleted += 1
    user.stats.totalScore += score
    user.stats.currentStreak += 1
    user.stats.longestStreak = Math.max(user.stats.longestStreak, user.stats.currentStreak)
    user.addExperience(score / 10)
    user.updateRank()
    
    await user.save()
    
    res.json({ 
      message: 'Daily challenge completed!',
      score,
      streak: user.stats.currentStreak,
      experience: user.experience,
      level: user.level
    })
    
  } catch (err) {
    console.error('Complete daily challenge error:', err)
    res.status(500).json({ error: 'Could not complete daily challenge' })
  }
})

// Get daily challenge leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const challenge = await DailyChallenge.findOne({ 
      date: today,
      isActive: true 
    }).populate('completions.userId', 'name')
    
    if (!challenge) {
      return res.json([])
    }
    
    const leaderboard = challenge.completions
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((completion, index) => ({
        rank: index + 1,
        username: completion.userId.name,
        score: completion.score,
        time: completion.time,
        moves: completion.moves,
        hints: completion.hints,
        completedAt: completion.completedAt
      }))
    
    res.json(leaderboard)
  } catch (err) {
    console.error('Daily challenge leaderboard error:', err)
    res.status(500).json({ error: 'Could not fetch leaderboard' })
  }
})

// Get user's daily challenge history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id
    const limit = parseInt(req.query.limit) || 30
    
    const challenges = await DailyChallenge.find({
      'completions.userId': userId
    })
    .sort({ date: -1 })
    .limit(limit)
    
    const history = challenges.map(challenge => {
      const userCompletion = challenge.completions.find(
        completion => completion.userId.toString() === userId
      )
      
      return {
        date: challenge.date,
        boardSize: challenge.boardSize,
        difficulty: challenge.difficulty,
        score: userCompletion.score,
        time: userCompletion.time,
        moves: userCompletion.moves,
        hints: userCompletion.hints,
        completedAt: userCompletion.completedAt
      }
    })
    
    res.json(history)
  } catch (err) {
    console.error('Daily challenge history error:', err)
    res.status(500).json({ error: 'Could not fetch challenge history' })
  }
})

// Helper function to create daily challenge
async function createDailyChallenge(date) {
  const difficulties = ['beginner', 'intermediate', 'hard', 'expert']
  const boardSizes = { beginner: [4, 6], intermediate: [6, 8], hard: [8, 10], expert: [10, 12] }
  const timeLimits = { beginner: 600, intermediate: 480, hard: 360, expert: 240 }
  const basePoints = { beginner: 500, intermediate: 750, hard: 1000, expert: 1500 }
  
  // Use date to seed randomness for consistent daily challenges
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)
  const difficultyIndex = dayOfYear % difficulties.length
  const difficulty = difficulties[difficultyIndex]
  
  const possibleSizes = boardSizes[difficulty]
  const boardSize = possibleSizes[dayOfYear % possibleSizes.length]
  
  const challenge = new DailyChallenge({
    date,
    boardSize,
    difficulty,
    timeLimit: timeLimits[difficulty],
    maxHints: difficulty === 'expert' ? 1 : difficulty === 'hard' ? 2 : 3,
    points: basePoints[difficulty]
  })
  
  await challenge.save()
  return challenge
}

export default router
