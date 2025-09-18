import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Async thunks
export const saveGame = createAsyncThunk(
  'game/save',
  async (gameData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/games`, gameData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save game')
    }
  }
)

export const fetchUserGames = createAsyncThunk(
  'game/fetchUserGames',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/games/user/${userId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch games')
    }
  }
)

export const fetchLeaderboard = createAsyncThunk(
  'game/fetchLeaderboard',
  async (category = '', { rejectWithValue }) => {
    try {
      const url = category 
        ? `${API_BASE_URL}/games/leaderboard/${category}`
        : `${API_BASE_URL}/games/leaderboard`
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard')
    }
  }
)

export const fetchDailyChallenge = createAsyncThunk(
  'game/fetchDailyChallenge',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/daily-challenges/today`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch daily challenge')
    }
  }
)

export const completeDailyChallenge = createAsyncThunk(
  'game/completeDailyChallenge',
  async (challengeData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/daily-challenges/complete`, challengeData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete daily challenge')
    }
  }
)

const initialState = {
  // Current game state
  currentGame: {
    mode: 'classic',
    boardSize: 8,
    board: [],
    queens: [],
    moves: 0,
    time: 0,
    hints: 0,
    hintsUsed: 0,
    maxHints: 3,
    solved: false,
    score: 0,
    difficulty: 'beginner',
    isGameActive: false,
    startTime: null,
  },
  
  // Game history and stats
  userGames: [],
  leaderboard: [],
  dailyChallenge: null,
  
  // UI state
  showHint: false,
  selectedCell: null,
  validMoves: [],
  gameMessage: '',
  
  // Loading states
  loading: {
    saving: false,
    fetching: false,
    leaderboard: false,
    dailyChallenge: false,
  },
  
  error: null,
}

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // Game setup
    initializeGame: (state, action) => {
      const { mode, boardSize, difficulty } = action.payload
      state.currentGame = {
        ...initialState.currentGame,
        mode,
        boardSize,
        difficulty,
        board: Array(boardSize).fill().map(() => Array(boardSize).fill(0)),
        queens: [],
        maxHints: difficulty === 'expert' ? 1 : difficulty === 'hard' ? 2 : 3,
        isGameActive: true,
        startTime: Date.now(),
      }
    },
    
    // Game actions
    placeQueen: (state, action) => {
      const { row, col } = action.payload
      const { boardSize, queens } = state.currentGame
      
      // Remove existing queen in the same row
      const existingQueenIndex = queens.findIndex(q => q[0] === row)
      if (existingQueenIndex !== -1) {
        queens.splice(existingQueenIndex, 1)
      }
      
      // Add new queen
      queens.push([row, col])
      state.currentGame.moves += 1
      
      // Update board
      state.currentGame.board = Array(boardSize).fill().map(() => Array(boardSize).fill(0))
      queens.forEach(([r, c]) => {
        state.currentGame.board[r][c] = 1
      })
      
      // Check if solved
      if (queens.length === boardSize && isValidSolution(queens, boardSize)) {
        state.currentGame.solved = true
        state.currentGame.isGameActive = false
        state.currentGame.time = Math.floor((Date.now() - state.currentGame.startTime) / 1000)
        state.gameMessage = 'Congratulations! You solved the N-Queens puzzle!'
      }
    },
    
    removeQueen: (state, action) => {
      const { row } = action.payload
      const queenIndex = state.currentGame.queens.findIndex(q => q[0] === row)
      if (queenIndex !== -1) {
        state.currentGame.queens.splice(queenIndex, 1)
        state.currentGame.moves += 1
        
        // Update board
        const { boardSize, queens } = state.currentGame
        state.currentGame.board = Array(boardSize).fill().map(() => Array(boardSize).fill(0))
        queens.forEach(([r, c]) => {
          state.currentGame.board[r][c] = 1
        })
      }
    },
    
    useHint: (state) => {
      if (state.currentGame.hintsUsed < state.currentGame.maxHints) {
        state.currentGame.hintsUsed += 1
        state.currentGame.hints += 1
        state.showHint = true
        // Logic for showing hint would be implemented in component
      }
    },
    
    resetGame: (state) => {
      const { mode, boardSize, difficulty } = state.currentGame
      state.currentGame = {
        ...initialState.currentGame,
        mode,
        boardSize,
        difficulty,
        board: Array(boardSize).fill().map(() => Array(boardSize).fill(0)),
        queens: [],
        maxHints: difficulty === 'expert' ? 1 : difficulty === 'hard' ? 2 : 3,
        isGameActive: true,
        startTime: Date.now(),
      }
      state.gameMessage = ''
      state.showHint = false
    },
    
    // UI actions
    setSelectedCell: (state, action) => {
      state.selectedCell = action.payload
    },
    
    setValidMoves: (state, action) => {
      state.validMoves = action.payload
    },
    
    setGameMessage: (state, action) => {
      state.gameMessage = action.payload
    },
    
    clearError: (state) => {
      state.error = null
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Save game
      .addCase(saveGame.pending, (state) => {
        state.loading.saving = true
      })
      .addCase(saveGame.fulfilled, (state, action) => {
        state.loading.saving = false
        state.currentGame.score = action.payload.score
      })
      .addCase(saveGame.rejected, (state, action) => {
        state.loading.saving = false
        state.error = action.payload
      })
      
      // Fetch user games
      .addCase(fetchUserGames.pending, (state) => {
        state.loading.fetching = true
      })
      .addCase(fetchUserGames.fulfilled, (state, action) => {
        state.loading.fetching = false
        state.userGames = action.payload
      })
      .addCase(fetchUserGames.rejected, (state, action) => {
        state.loading.fetching = false
        state.error = action.payload
      })
      
      // Fetch leaderboard
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading.leaderboard = true
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading.leaderboard = false
        state.leaderboard = action.payload
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading.leaderboard = false
        state.error = action.payload
      })
      
      // Daily challenge
      .addCase(fetchDailyChallenge.pending, (state) => {
        state.loading.dailyChallenge = true
      })
      .addCase(fetchDailyChallenge.fulfilled, (state, action) => {
        state.loading.dailyChallenge = false
        state.dailyChallenge = action.payload
      })
      .addCase(fetchDailyChallenge.rejected, (state, action) => {
        state.loading.dailyChallenge = false
        state.error = action.payload
      })
      
      .addCase(completeDailyChallenge.fulfilled, (state, action) => {
        state.gameMessage = `Daily challenge completed! Score: ${action.payload.score}`
      })
  },
})

// Helper function to validate N-Queens solution
function isValidSolution(queens, boardSize) {
  if (queens.length !== boardSize) return false
  
  for (let i = 0; i < queens.length; i++) {
    for (let j = i + 1; j < queens.length; j++) {
      const [r1, c1] = queens[i]
      const [r2, c2] = queens[j]
      
      // Check row, column, and diagonal conflicts
      if (r1 === r2 || c1 === c2 || Math.abs(r1 - r2) === Math.abs(c1 - c2)) {
        return false
      }
    }
  }
  
  return true
}

export const {
  initializeGame,
  placeQueen,
  removeQueen,
  useHint,
  resetGame,
  setSelectedCell,
  setValidMoves,
  setGameMessage,
  clearError,
} = gameSlice.actions

export default gameSlice.reducer
