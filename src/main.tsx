import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

// Initialize native features if running on native platform
const initNativeFeatures = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      // Configure status bar
      await StatusBar.setStyle({ style: Style.Dark })
      await StatusBar.setBackgroundColor({ color: '#0B1F3F' })
      
      // Hide splash screen after app is ready
      await SplashScreen.hide()
      
      // Handle app state changes
      CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active:', isActive)
      })
      
      // Handle back button on Android
      CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          CapacitorApp.exitApp()
        } else {
          window.history.back()
        }
      })
    } catch (error) {
      console.error('Error initializing native features:', error)
    }
  }
}

// Register service worker with update prompt (for web/PWA)
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload to update?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
})

// Initialize native features then render app
initNativeFeatures().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
