import mongoose from 'mongoose'

const gameSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mode: {
    type: String,
    required: true,
    default: 'classic',
    enum: ['classic', 'time-trial', 'puzzle-mode', 'multiplayer']
  },
  category: {
    type: String,
    required: true,
    default: 'classic',
    enum: ['classic', 'modern', 'adventure', 'expert']
  },
  size: {
    type: Number,
    required: true
  },
  queens: [[Number]],
  time: {
    type: Number,
    default: 0
  },
  moves: {
    type: Number,
    default: 0
  },
  hints: {
    type: Number,
    default: 0
  },
  solved: {
    type: Boolean,
    default: false
  },
  score: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Calculate score based on time, moves, and hints
gameSchema.pre('save', function(next) {
  if (this.solved) {
    // Base score: 1000 points for solving
    let baseScore = 1000;
    
    // Bonus for faster time (max 500 points)
    const timeBonus = Math.max(0, 500 - Math.floor(this.time / 10));
    
    // Penalty for more moves (max -200 points)
    const movePenalty = Math.min(200, this.moves * 10);
    
    // Penalty for hints (max -300 points)
    const hintPenalty = this.hints * 100;
    
    // Size bonus (bigger board = more points)
    const sizeBonus = (this.size - 4) * 50;
    
    this.score = baseScore + timeBonus - movePenalty - hintPenalty + sizeBonus;
  }
  next();
});

export default mongoose.model('Game', gameSchema)
