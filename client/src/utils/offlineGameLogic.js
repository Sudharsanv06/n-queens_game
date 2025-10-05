// Offline Game System - Standalone N-Queens Game Logic
export class OfflineGameLogic {
  
  // Initialize a new game board
  static createBoard(size = 8) {
    const board = Array(size).fill().map(() => Array(size).fill(0))
    return {
      size,
      board,
      queens: [],
      isComplete: false,
      moves: 0,
      startTime: Date.now(),
      endTime: null
    }
  }

  // Check if placing a queen at (row, col) is valid
  static isValidPlacement(board, row, col, size) {
    // Check this row on left side
    for (let i = 0; i < col; i++) {
      if (board[row][i] === 1) return false
    }

    // Check upper diagonal on left side
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === 1) return false
    }

    // Check lower diagonal on left side
    for (let i = row + 1, j = col - 1; i < size && j >= 0; i++, j--) {
      if (board[i][j] === 1) return false
    }

    // Check column
    for (let i = 0; i < size; i++) {
      if (board[i][col] === 1) return false
    }

    // Check upper diagonal on right side
    for (let i = row - 1, j = col + 1; i >= 0 && j < size; i--, j++) {
      if (board[i][j] === 1) return false
    }

    // Check lower diagonal on right side  
    for (let i = row + 1, j = col + 1; i < size && j < size; i++, j++) {
      if (board[i][j] === 1) return false
    }

    return true
  }

  // Place or remove queen at position
  static toggleQueen(gameState, row, col) {
    const { board, queens, size } = gameState
    const isQueenPresent = board[row][col] === 1

    if (isQueenPresent) {
      // Remove queen
      board[row][col] = 0
      gameState.queens = queens.filter(q => !(q.row === row && q.col === col))
    } else {
      // Check if placement is valid
      if (!this.isValidPlacement(board, row, col, size)) {
        return {
          success: false,
          message: 'Invalid placement! Queens cannot attack each other.',
          gameState
        }
      }

      // Place queen
      board[row][col] = 1
      gameState.queens.push({ row, col })
      gameState.moves++
    }

    // Check if game is complete
    gameState.isComplete = this.checkWinCondition(gameState)
    if (gameState.isComplete && !gameState.endTime) {
      gameState.endTime = Date.now()
    }

    return {
      success: true,
      message: isQueenPresent ? 'Queen removed' : 'Queen placed',
      gameState,
      isComplete: gameState.isComplete
    }
  }

  // Check if all queens are placed correctly
  static checkWinCondition(gameState) {
    const { queens, size } = gameState
    
    // Must have exactly 'size' number of queens
    if (queens.length !== size) return false

    // Check if any queens attack each other
    for (let i = 0; i < queens.length; i++) {
      for (let j = i + 1; j < queens.length; j++) {
        if (this.queensAttackEachOther(queens[i], queens[j])) {
          return false
        }
      }
    }

    return true
  }

  // Check if two queens attack each other
  static queensAttackEachOther(queen1, queen2) {
    const { row: r1, col: c1 } = queen1
    const { row: r2, col: c2 } = queen2

    // Same row or column
    if (r1 === r2 || c1 === c2) return true

    // Same diagonal
    if (Math.abs(r1 - r2) === Math.abs(c1 - c2)) return true

    return false
  }

  // Get hint for next move
  static getHint(gameState) {
    const { board, size, queens } = gameState

    // Try to find a valid position for the next queen
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] === 0 && this.isValidPlacement(board, row, col, size)) {
          return {
            row,
            col,
            message: `Try placing a queen at row ${row + 1}, column ${col + 1}`
          }
        }
      }
    }

    // If no valid moves, suggest removing a queen
    if (queens.length > 0) {
      const lastQueen = queens[queens.length - 1]
      return {
        row: lastQueen.row,
        col: lastQueen.col,
        message: `Consider removing the queen at row ${lastQueen.row + 1}, column ${lastQueen.col + 1}`
      }
    }

    return {
      message: 'No hints available. Try a different strategy!'
    }
  }

  // Reset the game
  static resetGame(size = 8) {
    return this.createBoard(size)
  }

  // Get game statistics
  static getGameStats(gameState) {
    const { queens, moves, startTime, endTime, isComplete, size } = gameState
    const duration = endTime ? (endTime - startTime) / 1000 : (Date.now() - startTime) / 1000

    return {
      queensPlaced: queens.length,
      totalQueens: size,
      moves,
      duration: Math.round(duration),
      isComplete,
      accuracy: moves > 0 ? Math.round((queens.length / moves) * 100) : 0
    }
  }

  // Solve the puzzle automatically (backtracking algorithm)
  static solvePuzzle(size) {
    const board = Array(size).fill().map(() => Array(size).fill(0))
    const solution = []

    const backtrack = (col) => {
      if (col >= size) return true

      for (let row = 0; row < size; row++) {
        if (this.isValidPlacement(board, row, col, size)) {
          board[row][col] = 1
          solution.push({ row, col })

          if (backtrack(col + 1)) return true

          // Backtrack
          board[row][col] = 0
          solution.pop()
        }
      }

      return false
    }

    if (backtrack(0)) {
      return {
        solved: true,
        solution,
        board
      }
    }

    return {
      solved: false,
      message: 'No solution exists for this board size'
    }
  }

  // Generate daily challenge
  static generateDailyChallenge() {
    const sizes = [4, 6, 8, 10]
    const today = new Date().toDateString()
    
    // Use date as seed for consistent daily challenges
    const seed = today.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    const size = sizes[Math.abs(seed) % sizes.length]
    const solution = this.solvePuzzle(size)
    
    return {
      id: `daily_${today.replace(/\s/g, '_')}`,
      date: today,
      size,
      difficulty: this.getDifficulty(size),
      solution: solution.solved ? solution.solution : [],
      completed: false
    }
  }

  // Get difficulty level
  static getDifficulty(size) {
    if (size <= 4) return 'Easy'
    if (size <= 6) return 'Medium' 
    if (size <= 8) return 'Hard'
    return 'Expert'
  }

  // Save game progress
  static saveGameProgress(gameState, userId = 'offline_user') {
    try {
      const savedGames = JSON.parse(localStorage.getItem('nqueens_saved_games') || '[]')
      
      const gameData = {
        id: Date.now().toString(),
        userId,
        ...gameState,
        savedAt: new Date().toISOString()
      }

      savedGames.push(gameData)
      
      // Keep only last 10 saved games
      if (savedGames.length > 10) {
        savedGames.splice(0, savedGames.length - 10)
      }

      localStorage.setItem('nqueens_saved_games', JSON.stringify(savedGames))
      return gameData

    } catch (error) {
      console.error('Error saving game:', error)
      return null
    }
  }

  // Load saved games
  static loadSavedGames(userId = 'offline_user') {
    try {
      const savedGames = JSON.parse(localStorage.getItem('nqueens_saved_games') || '[]')
      return savedGames.filter(game => game.userId === userId)
    } catch (error) {
      console.error('Error loading saved games:', error)
      return []
    }
  }
}