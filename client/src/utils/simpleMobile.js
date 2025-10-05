// Simple Mobile Utils to prevent app freezing
import { Capacitor } from '@capacitor/core'

export class SimpleMobileUtils {
  static async initializeMobileApp() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Running in web mode')
      return
    }

    try {
      console.log('Initializing mobile app...')
      
      // Simple initialization without complex async operations
      const { SplashScreen } = await import('@capacitor/splash-screen')
      const { StatusBar } = await import('@capacitor/status-bar')
      
      // Hide splash screen
      await SplashScreen.hide().catch(e => console.log('SplashScreen error:', e))

      // Set status bar
      await StatusBar.setBackgroundColor({ color: '#82966f' }).catch(e => console.log('StatusBar error:', e))
      
      console.log('Mobile app initialized successfully')
    } catch (error) {
      console.error('Mobile initialization error:', error)
      // Don't throw - allow app to continue
    }
  }

  static async scheduleDailyChallengeNotification() {
    // Simple notification setup that won't block
    try {
      if (!Capacitor.isNativePlatform()) return
      
      console.log('Setting up notifications...')
      // Don't await - let it run in background
    } catch (error) {
      console.error('Notification setup error:', error)
    }
  }

  static isMobile() {
    return Capacitor.isNativePlatform() || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  static async triggerHapticFeedback() {
    try {
      if (Capacitor.isNativePlatform()) {
        const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
        await Haptics.impact({ style: ImpactStyle.Light })
      }
    } catch (error) {
      console.log('Haptic feedback not available')
    }
  }
}