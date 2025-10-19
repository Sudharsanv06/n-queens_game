import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.nqueens.premium.game',
  appName: 'N-Queens Premium',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      launchFadeOutDuration: 3000,
      backgroundColor: "#0f1729",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#ffd700"
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0f1729"
    },
    Haptics: {},
    Keyboard: {
      resize: "body" as any,
      style: "DARK" as any,
      resizeOnFullScreen: true
    },
    App: {
      launchUrl: "",
      iosCustomApplicationProtocols: ["nqueens"]
    }
  }
}

export default config
