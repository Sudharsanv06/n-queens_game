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
          utils: ['axios', 'clsx', 'tailwind-merge', 'class-variance-authority'],
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
          // Icons and other UI components
          icons: ['lucide-react', 'react-hot-toast']
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1000kB
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    }
  }
})
