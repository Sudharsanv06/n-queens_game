import express from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

// Signup
router.post('/signup', async (req, res) => {
  console.log('Signup request received:', { ...req.body, password: '[REDACTED]' })
  
  const { name, email, mobile, password } = req.body
  
  try {
    // Input validation
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' })
    }
    
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' })
    }
    
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ message: 'Mobile number must be exactly 10 digits' })
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' })
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { mobile: mobile }
      ]
    })
    
    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ message: 'Email is already registered' })
      }
      if (existingUser.mobile === mobile) {
        return res.status(400).json({ message: 'Mobile number is already registered' })
      }
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    
    // Create new user
    const user = new User({ 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      mobile: mobile.trim(), 
      password: hashedPassword,
      lastLogin: new Date()
    })
    
    await user.save()
    console.log('User created successfully:', user.email)

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET || 'dev_secret_key_change_in_production', 
      { expiresIn: '7d' }
    )

    // Return success response (don't send token to avoid auto-login)
    res.status(201).json({
      message: 'Account created successfully. Please log in to continue.',
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile
      }
    })
  } catch (err) {
    console.error('Signup error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      keyPattern: err.keyPattern,
      keyValue: err.keyValue
    })
    
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field'
      const value = err.keyValue ? err.keyValue[field] : 'value'
      return res.status(400).json({ 
        message: `${field === 'email' ? 'Email' : 'Mobile number'} '${value}' is already registered` 
      })
    }
    
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message)
      return res.status(400).json({ 
        message: errors.join(', ') 
      })
    }
    
    // Handle MongoDB connection errors
    if (err.name === 'MongoNetworkError' || err.name === 'MongoServerError') {
      return res.status(500).json({ 
        message: 'Database connection error. Please try again later.' 
      })
    }
    
    // Generic error handling
    res.status(500).json({ 
      message: 'Failed to create account. Please try again.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
})

// Login
router.post('/login', async (req, res) => {
  console.log('Login request received for:', req.body.email)
  
  const { email, password } = req.body
  
  try {
    // Input validation
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' })
    }
    
    if (!password) {
      return res.status(400).json({ message: 'Password is required' })
    }
    
    // Find user by email (case-insensitive)
    const user = await User.findOne({ 
      email: email.toLowerCase().trim() 
    })
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    
    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated. Please contact support.' })
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()
    
    console.log('Login successful for:', user.email)

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        name: user.name 
      }, 
      process.env.JWT_SECRET || 'dev_secret_key_change_in_production', 
      { expiresIn: '7d' }
    )

    res.status(200).json({
      message: 'Login successful',
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        stats: user.stats,
        level: user.level,
        rank: user.rank,
        preferences: user.preferences
      }
    })
  } catch (err) {
    console.error('Login error details:', {
      name: err.name,
      message: err.message,
      email: email
    })
    
    // Handle MongoDB connection errors
    if (err.name === 'MongoNetworkError' || err.name === 'MongoServerError') {
      return res.status(500).json({ 
        message: 'Database connection error. Please try again later.' 
      })
    }
    
    res.status(500).json({ 
      message: 'Login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
})

export default router
