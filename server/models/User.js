import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: 'Mobile number must be exactly 10 digits'
    }
  },
  password: { type: String, required: true },
  
  // Game Statistics
  stats: {
    totalGames: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    totalTime: { type: Number, default: 0 }, // in seconds
    bestTime: { type: Number, default: null },
    totalScore: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    hintsUsed: { type: Number, default: 0 },
    dailyChallengesCompleted: { type: Number, default: 0 },
    multiplayerWins: { type: Number, default: 0 },
    multiplayerGames: { type: Number, default: 0 }
  },
  
  // Ranking & Experience
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  rank: { type: String, default: 'Novice' },
  
  // Achievements/Badges
  achievements: [{
    name: String,
    description: String,
    unlockedAt: { type: Date, default: Date.now },
    icon: String
  }],
  
  // Preferences
  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    notifications: { type: Boolean, default: true },
    soundEffects: { type: Boolean, default: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'hard', 'expert'], default: 'beginner' }
  },
  
  // Account status
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: Date.now }
}, { timestamps: true })

// Calculate user rank based on total score
userSchema.methods.updateRank = function() {
  const totalScore = this.stats.totalScore
  if (totalScore >= 50000) this.rank = 'Grandmaster'
  else if (totalScore >= 25000) this.rank = 'Master'
  else if (totalScore >= 10000) this.rank = 'Expert'
  else if (totalScore >= 5000) this.rank = 'Advanced'
  else if (totalScore >= 1000) this.rank = 'Intermediate'
  else this.rank = 'Novice'
}

// Update experience and level
userSchema.methods.addExperience = function(points) {
  this.experience += points
  const newLevel = Math.floor(this.experience / 1000) + 1
  if (newLevel > this.level) {
    this.level = newLevel
    // Could trigger achievement unlock here
  }
}

export default mongoose.model('User', userSchema)
