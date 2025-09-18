import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { io } from 'socket.io-client'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

// Socket instance
let socket = null

// Async thunks
export const createRoom = createAsyncThunk(
  'multiplayer/createRoom',
  async (roomData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/multiplayer/rooms`, roomData)
      return response.data.room
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create room')
    }
  }
)

export const joinRoom = createAsyncThunk(
  'multiplayer/joinRoom',
  async ({ roomId, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/multiplayer/rooms/${roomId}/join`, { password })
      return response.data.room
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to join room')
    }
  }
)

export const leaveRoom = createAsyncThunk(
  'multiplayer/leaveRoom',
  async (roomId, { rejectWithValue }) => {
    try {
      await axios.post(`${API_BASE_URL}/multiplayer/rooms/${roomId}/leave`)
      return roomId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to leave room')
    }
  }
)

export const setPlayerReady = createAsyncThunk(
  'multiplayer/setReady',
  async ({ roomId, isReady }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/multiplayer/rooms/${roomId}/ready`, { isReady })
      return response.data.room
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update ready status')
    }
  }
)

export const startGame = createAsyncThunk(
  'multiplayer/startGame',
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/multiplayer/rooms/${roomId}/start`)
      return response.data.room
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start game')
    }
  }
)

export const fetchAvailableRooms = createAsyncThunk(
  'multiplayer/fetchRooms',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters)
      const response = await axios.get(`${API_BASE_URL}/multiplayer/rooms?${params}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch rooms')
    }
  }
)

export const completeMultiplayerGame = createAsyncThunk(
  'multiplayer/completeGame',
  async ({ roomId, gameData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/multiplayer/rooms/${roomId}/complete`, gameData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete game')
    }
  }
)

const initialState = {
  // Socket connection
  isConnected: false,
  
  // Current room state
  currentRoom: null,
  isInRoom: false,
  
  // Available rooms
  availableRooms: [],
  
  // Game state
  gameState: 'waiting', // waiting, ready, in-progress, completed
  players: [],
  currentPlayer: null,
  opponentMoves: [],
  
  // Chat
  chatMessages: [],
  
  // Loading states
  loading: {
    creating: false,
    joining: false,
    fetching: false,
    starting: false,
  },
  
  error: null,
}

const multiplayerSlice = createSlice({
  name: 'multiplayer',
  initialState,
  reducers: {
    // Socket connection
    connectSocket: (state, action) => {
      const { token } = action.payload
      if (!socket) {
        socket = io(SOCKET_URL, {
          auth: { token }
        })
        
        socket.on('connect', () => {
          state.isConnected = true
        })
        
        socket.on('disconnect', () => {
          state.isConnected = false
        })
        
        socket.on('player_joined', (data) => {
          if (state.currentRoom) {
            // Update players list
            state.chatMessages.push({
              type: 'system',
              message: 'A player joined the room',
              timestamp: Date.now()
            })
          }
        })
        
        socket.on('player_left', (data) => {
          if (state.currentRoom) {
            state.chatMessages.push({
              type: 'system',
              message: 'A player left the room',
              timestamp: Date.now()
            })
          }
        })
        
        socket.on('opponent_move', (move) => {
          state.opponentMoves.push(move)
        })
        
        socket.on('chat_message', (data) => {
          state.chatMessages.push({
            type: 'user',
            message: data.message,
            from: data.from,
            timestamp: Date.now()
          })
        })
      }
    },
    
    disconnectSocket: (state) => {
      if (socket) {
        socket.disconnect()
        socket = null
      }
      state.isConnected = false
    },
    
    // Room actions
    joinSocketRoom: (state, action) => {
      const { roomId } = action.payload
      if (socket) {
        socket.emit('join_room', roomId)
      }
    },
    
    leaveSocketRoom: (state, action) => {
      const { roomId } = action.payload
      if (socket) {
        socket.emit('leave_room', roomId)
      }
      state.currentRoom = null
      state.isInRoom = false
      state.chatMessages = []
      state.opponentMoves = []
    },
    
    // Game actions
    sendMove: (state, action) => {
      const { roomId, move } = action.payload
      if (socket) {
        socket.emit('make_move', { roomId, move })
      }
    },
    
    sendChatMessage: (state, action) => {
      const { roomId, message } = action.payload
      if (socket) {
        socket.emit('chat_message', { roomId, message })
        state.chatMessages.push({
          type: 'user',
          message,
          from: 'You',
          timestamp: Date.now()
        })
      }
    },
    
    clearOpponentMoves: (state) => {
      state.opponentMoves = []
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    resetMultiplayerState: (state) => {
      return {
        ...initialState,
        isConnected: state.isConnected
      }
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Create room
      .addCase(createRoom.pending, (state) => {
        state.loading.creating = true
        state.error = null
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.loading.creating = false
        state.currentRoom = action.payload
        state.isInRoom = true
        state.gameState = action.payload.gameState
        state.players = action.payload.players
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.loading.creating = false
        state.error = action.payload
      })
      
      // Join room
      .addCase(joinRoom.pending, (state) => {
        state.loading.joining = true
        state.error = null
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
        state.loading.joining = false
        state.currentRoom = action.payload
        state.isInRoom = true
        state.gameState = action.payload.gameState
        state.players = action.payload.players
      })
      .addCase(joinRoom.rejected, (state, action) => {
        state.loading.joining = false
        state.error = action.payload
      })
      
      // Leave room
      .addCase(leaveRoom.fulfilled, (state) => {
        state.currentRoom = null
        state.isInRoom = false
        state.gameState = 'waiting'
        state.players = []
        state.chatMessages = []
        state.opponentMoves = []
      })
      
      // Set ready
      .addCase(setPlayerReady.fulfilled, (state, action) => {
        state.currentRoom = action.payload
        state.gameState = action.payload.gameState
        state.players = action.payload.players
      })
      
      // Start game
      .addCase(startGame.pending, (state) => {
        state.loading.starting = true
      })
      .addCase(startGame.fulfilled, (state, action) => {
        state.loading.starting = false
        state.currentRoom = action.payload
        state.gameState = action.payload.gameState
        state.chatMessages.push({
          type: 'system',
          message: 'Game started! Good luck!',
          timestamp: Date.now()
        })
      })
      .addCase(startGame.rejected, (state, action) => {
        state.loading.starting = false
        state.error = action.payload
      })
      
      // Fetch rooms
      .addCase(fetchAvailableRooms.pending, (state) => {
        state.loading.fetching = true
      })
      .addCase(fetchAvailableRooms.fulfilled, (state, action) => {
        state.loading.fetching = false
        state.availableRooms = action.payload
      })
      .addCase(fetchAvailableRooms.rejected, (state, action) => {
        state.loading.fetching = false
        state.error = action.payload
      })
      
      // Complete game
      .addCase(completeMultiplayerGame.fulfilled, (state, action) => {
        state.gameState = 'completed'
        const { isWinner, score } = action.payload
        state.chatMessages.push({
          type: 'system',
          message: isWinner ? `You won! Score: ${score}` : `Game completed! Score: ${score}`,
          timestamp: Date.now()
        })
      })
  },
})

export const {
  connectSocket,
  disconnectSocket,
  joinSocketRoom,
  leaveSocketRoom,
  sendMove,
  sendChatMessage,
  clearOpponentMoves,
  clearError,
  resetMultiplayerState,
} = multiplayerSlice.actions

export default multiplayerSlice.reducer
