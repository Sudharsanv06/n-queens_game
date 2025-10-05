// Simple Game Route Handler
import React from 'react'
import { Navigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { OfflineAuth } from '../utils/offlineAuth'
import OfflineNQueensGame from './OfflineNQueensGame'
import GameBoard from './GameBoard'
import MobileGameBoard from './MobileGameBoard'

const GameRoute = () => {
  // Check authentication
  const isAuthenticated = OfflineAuth.isAuthenticated()
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />
  }

  // Determine which game component to use
  const isMobile = Capacitor.isNativePlatform() || /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent)
  const isOffline = Capacitor.isNativePlatform() || !navigator.onLine

  console.log('Game Route - Mobile:', isMobile, 'Offline:', isOffline)

  // Always use offline game for mobile/offline mode
  if (isMobile || isOffline) {
    return <OfflineNQueensGame />
  }

  // Use regular game board for web
  return <GameBoard />
}

export default GameRoute