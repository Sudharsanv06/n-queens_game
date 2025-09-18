import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import gameSlice from './slices/gameSlice'
import multiplayerSlice from './slices/multiplayerSlice'
import uiSlice from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    game: gameSlice,
    multiplayer: multiplayerSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

// Export types for TypeScript usage (remove if using pure JavaScript)
// export type RootState = ReturnType<typeof store.getState>
// export type AppDispatch = typeof store.dispatch
