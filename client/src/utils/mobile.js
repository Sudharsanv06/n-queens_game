import { Capacitor } from '@capacitor/core'
import { StatusBar } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { Keyboard } from '@capacitor/keyboard'
import { Device } from '@capacitor/device'
import { Network } from '@capacitor/network'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { PushNotifications } from '@capacitor/push-notifications'
import { LocalNotifications } from '@capacitor/local-notifications'

export class MobileUtils {
  static async initializeMobileApp() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Running in web mode')
      return
    }

    try {
      // Hide splash screen
      await SplashScreen.hide()

      // Configure status bar
      await StatusBar.setBackgroundColor({ color: '#1e293b' })
      await StatusBar.setStyle({ style: 'DARK' })

      // Initialize notifications
      await this.initializeNotifications()

      // Get device info
      const deviceInfo = await Device.getInfo()
      console.log('Device Info:', deviceInfo)

      // Monitor network status
      const status = await Network.getStatus()
      console.log('Network status:', status)

      Network.addListener('networkStatusChange', status => {
        console.log('Network status changed', status)
      })

      // Keyboard listeners
      Keyboard.addListener('keyboardWillShow', info => {
        document.body.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`)
      })

      Keyboard.addListener('keyboardWillHide', () => {
        document.body.style.setProperty('--keyboard-height', '0px')
      })

    } catch (error) {
      console.error('Mobile initialization error:', error)
    }
  }

  static async initializeNotifications() {
    try {
      // Request permissions
      const permissionResult = await PushNotifications.requestPermissions()
      
      if (permissionResult.receive === 'granted') {
        // Register for push notifications
        await PushNotifications.register()

        // Listen for registration
        PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success, token: ' + token.value)
          // Send token to your server
          this.sendTokenToServer(token.value)
        })

        // Listen for registration errors
        PushNotifications.addListener('registrationError', (error) => {
          console.error('Push registration error: ', error)
        })

        // Listen for push notifications
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push received: ', notification)
          this.handlePushNotification(notification)
        })

        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push action performed: ', notification)
          this.handlePushAction(notification)
        })
      }

      // Local notifications permission
      const localPermission = await LocalNotifications.requestPermissions()
      if (localPermission.display === 'granted') {
        console.log('Local notifications enabled')
      }

    } catch (error) {
      console.error('Notification setup error:', error)
    }
  }

  static async sendTokenToServer(token) {
    try {
      // Send the token to your backend server
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user._id) {
        // Replace with your API endpoint
        await fetch('/api/users/push-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            userId: user._id,
            pushToken: token,
          }),
        })
      }
    } catch (error) {
      console.error('Error sending token to server:', error)
    }
  }

  static handlePushNotification(notification) {
    // Handle incoming push notification
    console.log('Handling push notification:', notification)
    
    // You can show a toast or update UI here
    if (window.toast) {
      window.toast.success(notification.title || 'New notification')
    }
  }

  static handlePushAction(notification) {
    // Handle notification tap/action
    console.log('Handling push action:', notification)
    
    // Navigate to appropriate screen based on notification data
    if (notification.notification.data?.screen) {
      window.location.href = notification.notification.data.screen
    }
  }

  static async scheduleDailyChallengeNotification() {
    try {
      if (!Capacitor.isNativePlatform()) return

      const permission = await LocalNotifications.requestPermissions()
      if (permission.display !== 'granted') return

      // Schedule daily challenge notification
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Daily N-Queens Challenge',
            body: 'A new daily challenge is waiting for you!',
            id: 1,
            schedule: {
              // Schedule for 9 AM every day
              on: {
                hour: 9,
                minute: 0,
              },
              repeats: true,
            },
            actionTypeId: 'daily_challenge',
            extra: {
              screen: '/daily-challenge',
            },
          },
        ],
      })

    } catch (error) {
      console.error('Error scheduling notification:', error)
    }
  }

  static async triggerHapticFeedback(style = ImpactStyle.Light) {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style })
      }
    } catch (error) {
      console.error('Haptic feedback error:', error)
    }
  }

  static async shareGame(gameData) {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'N-Queens Game',
          text: `I just solved a ${gameData.size}x${gameData.size} N-Queens puzzle in ${gameData.time} seconds!`,
          url: window.location.origin,
        })
      } else {
        // Fallback for browsers without native sharing
        const text = `I just solved a ${gameData.size}x${gameData.size} N-Queens puzzle in ${gameData.time} seconds! Play at ${window.location.origin}`
        await navigator.clipboard.writeText(text)
        if (window.toast) {
          window.toast.success('Game result copied to clipboard!')
        }
      }
    } catch (error) {
      console.error('Share error:', error)
    }
  }

  static isMobile() {
    return Capacitor.isNativePlatform() || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768
  }

  static async getDeviceInfo() {
    try {
      if (Capacitor.isNativePlatform()) {
        return await Device.getInfo()
      }
      return {
        platform: 'web',
        operatingSystem: navigator.platform,
        model: 'browser',
        manufacturer: 'unknown',
      }
    } catch (error) {
      console.error('Device info error:', error)
      return null
    }
  }

  static async getNetworkStatus() {
    try {
      if (Capacitor.isNativePlatform()) {
        return await Network.getStatus()
      }
      return {
        connected: navigator.onLine,
        connectionType: 'wifi', // Assumption for web
      }
    } catch (error) {
      console.error('Network status error:', error)
      return { connected: true, connectionType: 'unknown' }
    }
  }

  // Optimize images for different screen densities
  static getOptimizedImageUrl(baseUrl, screenDensity = 1) {
    if (screenDensity >= 3) {
      return `${baseUrl}@3x.png`
    } else if (screenDensity >= 2) {
      return `${baseUrl}@2x.png`
    }
    return `${baseUrl}.png`
  }

  // Handle back button for mobile
  static addBackButtonListener(callback) {
    if (Capacitor.isNativePlatform()) {
      document.addEventListener('backbutton', callback, false)
    }
  }

  static removeBackButtonListener(callback) {
    if (Capacitor.isNativePlatform()) {
      document.removeEventListener('backbutton', callback, false)
    }
  }
}

// Touch gestures helper
export class TouchGestureHelper {
  constructor(element, options = {}) {
    this.element = element
    this.options = {
      threshold: options.threshold || 10,
      allowedTime: options.allowedTime || 300,
      ...options,
    }
    
    this.startX = 0
    this.startY = 0
    this.distX = 0
    this.distY = 0
    this.startTime = 0
    this.elapsedTime = 0

    this.init()
  }

  init() {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true })
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true })
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true })
  }

  handleTouchStart(e) {
    const touch = e.changedTouches[0]
    this.startX = touch.screenX
    this.startY = touch.screenY
    this.startTime = new Date().getTime()
  }

  handleTouchMove(e) {
    e.preventDefault()
  }

  handleTouchEnd(e) {
    const touch = e.changedTouches[0]
    this.distX = touch.screenX - this.startX
    this.distY = touch.screenY - this.startY
    this.elapsedTime = new Date().getTime() - this.startTime

    if (this.elapsedTime <= this.options.allowedTime) {
      if (Math.abs(this.distX) >= this.options.threshold && Math.abs(this.distY) <= 100) {
        const direction = this.distX < 0 ? 'left' : 'right'
        this.onSwipe?.(direction, { distX: this.distX, distY: this.distY })
      } else if (Math.abs(this.distY) >= this.options.threshold && Math.abs(this.distX) <= 100) {
        const direction = this.distY < 0 ? 'up' : 'down'
        this.onSwipe?.(direction, { distX: this.distX, distY: this.distY })
      }
    }
  }

  onSwipe(direction, details) {
    // Override this method or set via options
    this.options.onSwipe?.(direction, details)
  }

  destroy() {
    this.element.removeEventListener('touchstart', this.handleTouchStart)
    this.element.removeEventListener('touchmove', this.handleTouchMove)
    this.element.removeEventListener('touchend', this.handleTouchEnd)
  }
}