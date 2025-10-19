import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React and React-related libraries
          react: ['react', 'react-dom', 'react-router-dom'],
          // Redux and state management
          redux: ['@reduxjs/toolkit', 'react-redux'],
          // UI libraries
          ui: ['@headlessui/react', '@heroicons/react', 'framer-motion'],
          // Utility libraries
          utils: ['axios', 'clsx', 'tailwind-merge', 'class-variance-authority', 'react-hot-toast'],
          // Socket and capacitor
          socket: ['socket.io-client'],
          capacitor: [
            '@capacitor/core',
            '@capacitor/device',
            '@capacitor/haptics',
            '@capacitor/keyboard',
            '@capacitor/local-notifications',
            '@capacitor/network',
            '@capacitor/push-notifications',
            '@capacitor/splash-screen',
            '@capacitor/status-bar'
          ],
          // Icons
          icons: ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
