import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // Theme
  theme: localStorage.getItem('theme') || 'light',
  
  // Navigation
  currentPage: 'home',
  
  // Modals and overlays
  modals: {
    gameSettings: false,
    leaderboard: false,
    achievements: false,
    profile: false,
    tutorial: false,
    multiplayerLobby: false,
    createRoom: false,
    joinRoom: false,
  },
  
  // Notifications
  notifications: [],
  
  // Loading states
  pageLoading: false,
  
  // Game UI
  gameUI: {
    showStats: true,
    showTimer: true,
    showMoves: true,
    showHints: true,
    boardAnimation: true,
    soundEffects: localStorage.getItem('soundEffects') !== 'false',
  },
  
  // Mobile responsiveness
  isMobile: window.innerWidth < 768,
  sidebarOpen: false,
  
  // Tutorial state
  tutorialStep: 0,
  showTutorial: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme
    setTheme: (state, action) => {
      state.theme = action.payload
      localStorage.setItem('theme', action.payload)
    },
    
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', state.theme)
    },
    
    // Navigation
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    },
    
    // Modals
    openModal: (state, action) => {
      const modalName = action.payload
      if (modalName in state.modals) {
        state.modals[modalName] = true
      }
    },
    
    closeModal: (state, action) => {
      const modalName = action.payload
      if (modalName in state.modals) {
        state.modals[modalName] = false
      }
    },
    
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modal => {
        state.modals[modal] = false
      })
    },
    
    // Notifications
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        type: 'info', // info, success, warning, error
        title: '',
        message: '',
        duration: 5000,
        ...action.payload,
      }
      state.notifications.push(notification)
    },
    
    removeNotification: (state, action) => {
      const id = action.payload
      state.notifications = state.notifications.filter(n => n.id !== id)
    },
    
    clearNotifications: (state) => {
      state.notifications = []
    },
    
    // Loading
    setPageLoading: (state, action) => {
      state.pageLoading = action.payload
    },
    
    // Game UI
    updateGameUI: (state, action) => {
      state.gameUI = { ...state.gameUI, ...action.payload }
    },
    
    toggleGameUISetting: (state, action) => {
      const setting = action.payload
      if (setting in state.gameUI) {
        state.gameUI[setting] = !state.gameUI[setting]
        
        // Persist certain settings
        if (setting === 'soundEffects') {
          localStorage.setItem('soundEffects', state.gameUI[setting])
        }
      }
    },
    
    // Mobile
    setIsMobile: (state, action) => {
      state.isMobile = action.payload
    },
    
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    
    closeSidebar: (state) => {
      state.sidebarOpen = false
    },
    
    // Tutorial
    startTutorial: (state) => {
      state.showTutorial = true
      state.tutorialStep = 0
    },
    
    nextTutorialStep: (state) => {
      state.tutorialStep += 1
    },
    
    prevTutorialStep: (state) => {
      if (state.tutorialStep > 0) {
        state.tutorialStep -= 1
      }
    },
    
    setTutorialStep: (state, action) => {
      state.tutorialStep = action.payload
    },
    
    closeTutorial: (state) => {
      state.showTutorial = false
      state.tutorialStep = 0
    },
    
    // Utility
    resetUI: (state) => {
      return {
        ...initialState,
        theme: state.theme,
        gameUI: {
          ...initialState.gameUI,
          soundEffects: state.gameUI.soundEffects,
        }
      }
    },
  },
})

export const {
  setTheme,
  toggleTheme,
  setCurrentPage,
  openModal,
  closeModal,
  closeAllModals,
  addNotification,
  removeNotification,
  clearNotifications,
  setPageLoading,
  updateGameUI,
  toggleGameUISetting,
  setIsMobile,
  toggleSidebar,
  closeSidebar,
  startTutorial,
  nextTutorialStep,
  prevTutorialStep,
  setTutorialStep,
  closeTutorial,
  resetUI,
} = uiSlice.actions

export default uiSlice.reducer
