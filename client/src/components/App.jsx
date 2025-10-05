import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { Capacitor } from '@capacitor/core'
import { store } from '../store/store'
import { SimpleMobileUtils as MobileUtils } from '../utils/simpleMobile'
import { OfflineGameStore } from '../utils/offlineStore'

// Import components
import Home from './Home'
import Login from './Login'
import Signup from './Signup'
import GameRoute from './GameRoute'
import GameBoard from './GameBoard'
import OfflineNQueensGame from './OfflineNQueensGame'
import MultiplayerGame from './MultiplayerGame'
import DailyChallenge from './DailyChallenge'
import Leaderboard from './Leaderboard'
import About from './About'
import Contact from './Contact'
import Tutorial from './Tutorial'
import GameModeSelection from './GameModeSelection'
import RegisteredGameModes from './RegisteredGameModes'

// Import CSS
import '../index.css'
import '../styles.css'
import './MobileGameBoard.css'
import './MultiplayerGame.css'
import './DailyChallenge.css'

const App = () => {
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [appInitialized, setAppInitialized] = useState(false)

  useEffect(() => {
    const initializeApp = () => {
      try {
        console.log('Initializing N-Queens Game...')
        
        // Check if running on mobile
        const isMobilePlatform = Capacitor.isNativePlatform()
        console.log('Mobile platform detected:', isMobilePlatform)
        
        if (isMobilePlatform) {
          // Set offline mode for mobile
          setIsOfflineMode(true)
          
          // Initialize offline store
          window.offlineStore = OfflineGameStore
          
          // Initialize mobile features asynchronously (don't block)
          setTimeout(() => {
            MobileUtils.initializeMobileApp().catch(console.error)
            MobileUtils.scheduleDailyChallengeNotification().catch(console.error)
          }, 100)
        }
        
        // Set up simple toast reference
        window.toast = {
          success: (message) => console.log('SUCCESS:', message),
          error: (message) => console.log('ERROR:', message),
          loading: (message) => console.log('LOADING:', message)
        }
        
        // Set initialized immediately
        setAppInitialized(true)
        console.log('App initialization complete')
      } catch (error) {
        console.error('App initialization error:', error)
        // Always allow app to load
        setAppInitialized(true)
      }
    }

    // Don't use async - keep it simple
    initializeApp()
  }, [])

  // Remove complex game component logic - handled in GameRoute

  // Show loading screen while initializing
  if (!appInitialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f3f7ee',
        fontSize: '18px',
        color: '#0d0d0d'
      }}>
        Loading N-Queens Game...
      </div>
    )
  }

  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/tutorial" element={<Tutorial />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            
            {/* Game routes */}
            <Route path="/game-modes" element={<GameModeSelection />} />
            <Route path="/registered-game-modes" element={<RegisteredGameModes />} />
            
            {/* Specific game mode routes */}
            <Route path="/game/free-trial" element={<GameBoard />} />
            <Route path="/game/classic" element={<GameBoard />} />
            <Route path="/game/time-trial" element={<GameBoard />} />
            <Route path="/game/puzzle-mode" element={<GameBoard />} />
            <Route path="/game/multiplayer" element={<GameBoard />} />
            
            {/* Fallback game routes */}
            <Route path="/game" element={<GameRoute />} />
            <Route path="/play" element={<GameRoute />} />
            <Route path="/offline-game" element={<OfflineNQueensGame />} />
            <Route path="/multiplayer" element={<MultiplayerGame />} />
            <Route path="/daily-challenge" element={<DailyChallenge />} />
            
            {/* Redirect legacy routes */}
            <Route path="/game-board" element={<Navigate to="/game" replace />} />
            
            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Global toast notifications */}
          <Toaster
            position={isOfflineMode ? "bottom-center" : "top-right"}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </Provider>
  )
}

export default App
