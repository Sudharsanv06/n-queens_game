import mongoose from 'mongoose'

const dailyChallengeSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  boardSize: {
    type: Number,
    required: true,
    min: 4,
    max: 12
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'hard', 'expert']
  },
  timeLimit: {
    type: Number, // in seconds
    required: true
  },
  maxHints: {
    type: Number,
    default: 3
  },
  points: {
    type: Number,
    required: true
  },
  completions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    time: Number,
    moves: Number,
    hints: Number,
    score: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

// Index for efficient date queries
dailyChallengeSchema.index({ date: 1 })
dailyChallengeSchema.index({ 'completions.userId': 1 })

export default mongoose.model('DailyChallenge', dailyChallengeSchema)
