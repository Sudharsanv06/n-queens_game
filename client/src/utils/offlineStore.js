// Offline Game Store for Mobile
export const OfflineGameStore = {
  // Local storage keys
  KEYS: {
    GAMES: 'nqueens_offline_games',
    USER_STATS: 'nqueens_user_stats',
    SETTINGS: 'nqueens_settings',
    DAILY_PROGRESS: 'nqueens_daily_progress'
  },

  // Save game result locally
  saveGame(gameData) {
    try {
      const games = this.getGames()
      const newGame = {
        id: Date.now().toString(),
        ...gameData,
        timestamp: new Date().toISOString(),
        offline: true
      }
      games.push(newGame)
      localStorage.setItem(this.KEYS.GAMES, JSON.stringify(games))
      this.updateStats(gameData)
      return newGame
    } catch (error) {
      console.error('Error saving game:', error)
      return null
    }
  },

  // Get all saved games
  getGames() {
    try {
      const games = localStorage.getItem(this.KEYS.GAMES)
      return games ? JSON.parse(games) : []
    } catch (error) {
      console.error('Error getting games:', error)
      return []
    }
  },

  // Update user statistics
  updateStats(gameData) {
    try {
      const stats = this.getStats()
      stats.totalGames += 1
      if (gameData.solved) {
        stats.solvedGames += 1
        stats.totalTime += gameData.timeElapsed || 0
        stats.averageTime = stats.totalTime / stats.solvedGames
      }
      stats.bestTimes[gameData.boardSize] = Math.min(
        stats.bestTimes[gameData.boardSize] || Infinity,
        gameData.timeElapsed || Infinity
      )
      localStorage.setItem(this.KEYS.USER_STATS, JSON.stringify(stats))
      return stats
    } catch (error) {
      console.error('Error updating stats:', error)
      return this.getStats()
    }
  },

  // Get user statistics
  getStats() {
    try {
      const stats = localStorage.getItem(this.KEYS.USER_STATS)
      return stats ? JSON.parse(stats) : {
        totalGames: 0,
        solvedGames: 0,
        totalTime: 0,
        averageTime: 0,
        bestTimes: {},
        streak: 0,
        lastPlayed: null
      }
    } catch (error) {
      console.error('Error getting stats:', error)
      return {
        totalGames: 0,
        solvedGames: 0,
        totalTime: 0,
        averageTime: 0,
        bestTimes: {},
        streak: 0,
        lastPlayed: null
      }
    }
  },

  // Generate daily challenge
  getDailyChallenge() {
    const today = new Date().toDateString()
    const stored = localStorage.getItem(this.KEYS.DAILY_PROGRESS)
    const dailyData = stored ? JSON.parse(stored) : {}
    
    if (dailyData.date !== today) {
      // Generate new daily challenge
      const sizes = [4, 6, 8, 10]
      const randomSize = sizes[Math.floor(Math.random() * sizes.length)]
      
      dailyData.date = today
      dailyData.challenge = {
        id: Date.now().toString(),
        size: randomSize,
        difficulty: this.calculateDifficulty(randomSize),
        completed: false,
        attempts: 0,
        bestTime: null
      }
      
      localStorage.setItem(this.KEYS.DAILY_PROGRESS, JSON.stringify(dailyData))
    }
    
    return dailyData.challenge
  },

  // Calculate difficulty based on board size
  calculateDifficulty(size) {
    if (size <= 4) return 'Easy'
    if (size <= 6) return 'Medium'
    if (size <= 8) return 'Hard'
    return 'Expert'
  },

  // Update daily challenge progress
  updateDailyProgress(challengeId, gameData) {
    try {
      const stored = localStorage.getItem(this.KEYS.DAILY_PROGRESS)
      const dailyData = stored ? JSON.parse(stored) : {}
      
      if (dailyData.challenge && dailyData.challenge.id === challengeId) {
        dailyData.challenge.attempts += 1
        if (gameData.solved) {
          dailyData.challenge.completed = true
          dailyData.challenge.bestTime = Math.min(
            dailyData.challenge.bestTime || Infinity,
            gameData.timeElapsed || Infinity
          )
        }
        
        localStorage.setItem(this.KEYS.DAILY_PROGRESS, JSON.stringify(dailyData))
      }
      
      return dailyData.challenge
    } catch (error) {
      console.error('Error updating daily progress:', error)
      return null
    }
  },

  // Clear all data (for debugging)
  clearAll() {
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }
}