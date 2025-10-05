// Offline Authentication System for Mobile App
import { Capacitor } from '@capacitor/core'
import { OfflineGameStore } from './offlineStore'

export class OfflineAuth {
  static STORAGE_KEYS = {
    USERS: 'nqueens_offline_users',
    CURRENT_USER: 'nqueens_current_user',
    SESSION: 'nqueens_session'
  }

  // Check if we're in offline mode (mobile app)
  static isOfflineMode() {
    return Capacitor.isNativePlatform() || 
           import.meta.env.VITE_OFFLINE_MODE === 'true' ||
           !navigator.onLine
  }

  // Register new user offline
  static async register(userData) {
    try {
      if (!this.isOfflineMode()) {
        // Try online registration first
        return await this.onlineRegister(userData)
      }

      const { name, email, mobile, password } = userData
      
      // Validate input
      if (!name || !email || !password) {
        throw new Error('All fields are required')
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      // Check if user already exists
      const users = this.getOfflineUsers()
      if (users.find(user => user.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('User already exists with this email')
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name,
        email: email.toLowerCase(), // Normalize email
        mobile: mobile || '',
        password: await this.hashPassword(password), // Simple hash for offline
        createdAt: new Date().toISOString(),
        stats: {
          gamesPlayed: 0,
          gamesWon: 0,
          totalTime: 0,
          bestTimes: {},
          streak: 0,
          levelCompletions: 0,
          totalLevelPoints: 0
        }
      }

      // Save user
      users.push(newUser)
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users))
      console.log('User registered successfully:', newUser.email)

      // Auto-login after registration
      const session = await this.createSession(newUser)
      return {
        success: true,
        user: this.sanitizeUser(newUser),
        token: session.token
      }

    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  // Login user offline
  static async login(credentials) {
    try {
      if (!this.isOfflineMode()) {
        // Try online login first
        return await this.onlineLogin(credentials)
      }

      const { email, password } = credentials
      
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      // Find user
      const users = this.getOfflineUsers()
      console.log('Stored users:', users.length, 'users found')
      console.log('Looking for email:', email)
      
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
      
      if (!user) {
        console.log('User not found in offline storage')
        throw new Error('Account not found. Please create an account first.')
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.password)
      if (!isValidPassword) {
        console.log('Password verification failed')
        throw new Error('Invalid email or password')
      }

      console.log('Login successful for user:', user.email)

      // Create session
      const session = await this.createSession(user)
      
      return {
        success: true,
        user: this.sanitizeUser(user),
        token: session.token
      }

    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Get current logged-in user
  static getCurrentUser() {
    try {
      const session = localStorage.getItem(this.STORAGE_KEYS.SESSION)
      if (!session) return null

      const sessionData = JSON.parse(session)
      
      // Check if session is expired
      if (new Date(sessionData.expiresAt) < new Date()) {
        this.logout()
        return null
      }

      const currentUser = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER)
      return currentUser ? JSON.parse(currentUser) : null
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  // Logout user
  static logout() {
    localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER)
    localStorage.removeItem(this.STORAGE_KEYS.SESSION)
    return { success: true }
  }

  // Check if user is authenticated
  static isAuthenticated() {
    return this.getCurrentUser() !== null
  }

  // Update user profile
  static async updateProfile(updates) {
    try {
      const currentUser = this.getCurrentUser()
      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      const users = this.getOfflineUsers()
      const userIndex = users.findIndex(u => u.id === currentUser.id)
      
      if (userIndex === -1) {
        throw new Error('User not found')
      }

      // Update user data
      users[userIndex] = { ...users[userIndex], ...updates, updatedAt: new Date().toISOString() }
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users))

      // Update current user session
      const updatedUser = this.sanitizeUser(users[userIndex])
      localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser))

      return {
        success: true,
        user: updatedUser
      }
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  // Update user stats (for level completions, game results, etc.)
  static updateUserStats(updatedUser) {
    try {
      const users = this.getOfflineUsers()
      const userIndex = users.findIndex(u => u.id === updatedUser.id)
      
      if (userIndex === -1) {
        console.error('User not found for stats update')
        return
      }

      // Update user in the users array
      users[userIndex] = { ...users[userIndex], ...updatedUser, updatedAt: new Date().toISOString() }
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users))

      // Update current user session if it's the same user
      const currentUser = this.getCurrentUser()
      if (currentUser && currentUser.id === updatedUser.id) {
        const sanitizedUser = this.sanitizeUser(users[userIndex])
        localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(sanitizedUser))
      }

      console.log('User stats updated successfully for user:', updatedUser.id)
    } catch (error) {
      console.error('Update user stats error:', error)
    }
  }

  // Helper methods
  static getOfflineUsers() {
    try {
      const users = localStorage.getItem(this.STORAGE_KEYS.USERS)
      return users ? JSON.parse(users) : []
    } catch (error) {
      console.error('Error getting offline users:', error)
      return []
    }
  }

  static async createSession(user) {
    const session = {
      userId: user.id,
      token: this.generateToken(),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    }

    localStorage.setItem(this.STORAGE_KEYS.SESSION, JSON.stringify(session))
    localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.sanitizeUser(user)))

    return session
  }

  static sanitizeUser(user) {
    const { password, ...safeUser } = user
    return safeUser
  }

  static generateToken() {
    return 'offline_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15)
  }

  static async hashPassword(password) {
    // Simple hash for offline use (in production, use proper crypto)
    return btoa(password + 'nqueens_salt')
  }

  static async verifyPassword(password, hashedPassword) {
    const computedHash = await this.hashPassword(password)
    console.log('Password verification:', { password, hashedPassword, computedHash, match: hashedPassword === computedHash })
    return hashedPassword === computedHash
  }

  // Online fallback methods
  static async onlineRegister(userData) {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Registration failed')
    }

    return await response.json()
  }

  static async onlineLogin(credentials) {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }

    const result = await response.json()
    
    // Store in localStorage for consistency
    localStorage.setItem('token', result.token)
    localStorage.setItem('user', JSON.stringify(result.user))
    
    return result
  }
}