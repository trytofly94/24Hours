/**
 * Main Entry Point
 * Initializes the 24Hours application
 */

// Import styles
import './styles/variables.css'
import './styles/main.css'
import './styles/circle.css'

// Import components and utilities
import { createCircleView } from './components/CircleView.js'
import { formatDate, formatTime, getCurrentHour, getCurrentMinute } from './lib/timeUtils.js'
import { getEvents, getSettings } from './lib/storage.js'

// Import PWA utilities
import { registerSW } from 'virtual:pwa-register'

/**
 * Application state
 */
const state = {
  circleView: null,
  events: [],
  settings: {},
  isLoading: false,
}

/**
 * Initialize the application
 */
async function init() {
  try {
    showLoading(true)

    // Load data from storage
    await loadData()

    // Initialize UI
    initializeUI()

    // Setup event listeners
    setupEventListeners()

    // Register service worker
    registerServiceWorker()

    showLoading(false)
  } catch (error) {
    console.error('Failed to initialize app:', error)
    showError('Failed to initialize application')
    showLoading(false)
  }
}

/**
 * Load data from storage
 */
async function loadData() {
  try {
    state.events = await getEvents()
    state.settings = await getSettings()
  } catch (error) {
    console.error('Failed to load data:', error)
  }
}

/**
 * Initialize UI components
 */
function initializeUI() {
  // Initialize circle view
  const container = document.getElementById('circle-container')
  if (container) {
    state.circleView = createCircleView(container, handleSegmentClick)
  }

  // Update info panel
  updateInfoPanel()

  // Update time every second
  setInterval(updateInfoPanel, 1000)
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Add event button
  const addEventButton = document.getElementById('add-event-button')
  if (addEventButton) {
    addEventButton.addEventListener('click', handleAddEvent)
  }

  // Settings button
  const settingsButton = document.getElementById('settings-button')
  if (settingsButton) {
    settingsButton.addEventListener('click', handleSettings)
  }

  // Global error handler
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    showError('An unexpected error occurred')
  })

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection:', event.reason)
    showError('An unexpected error occurred')
  })
}

/**
 * Handle circle segment click
 * @param {number} hour - Clicked hour (0-23)
 */
function handleSegmentClick(hour) {
  console.warn(`Segment clicked: ${hour}:00`)

  // Highlight the clicked segment
  if (state.circleView) {
    state.circleView.highlightHour(hour)
  }

  // Show notification (temporary - will be replaced with modal)
  showNotification(`Selected time: ${formatTime(hour, 0)}`)

  // Clear highlight after 2 seconds
  setTimeout(() => {
    if (state.circleView) {
      state.circleView.clearHighlights()
    }
  }, 2000)
}

/**
 * Handle add event button click
 */
function handleAddEvent() {
  const currentHour = getCurrentHour()
  console.warn('Add event clicked for current hour:', currentHour)

  // Highlight current hour
  if (state.circleView) {
    state.circleView.highlightHour(currentHour)
  }

  showNotification('Event creation coming soon!')
}

/**
 * Handle settings button click
 */
function handleSettings() {
  console.warn('Settings clicked')
  showNotification('Settings panel coming soon!')
}

/**
 * Update info panel with current date/time
 */
function updateInfoPanel() {
  const dateElement = document.getElementById('current-date')
  const timeElement = document.getElementById('current-time')

  if (dateElement) {
    dateElement.textContent = formatDate()
  }

  if (timeElement) {
    const hour = getCurrentHour()
    const minute = getCurrentMinute()
    timeElement.textContent = formatTime(hour, minute)
  }
}

/**
 * Show/hide loading indicator
 * @param {boolean} show - Whether to show loading indicator
 */
function showLoading(show) {
  const loadingElement = document.getElementById('loading')
  if (loadingElement) {
    loadingElement.hidden = !show
  }
  state.isLoading = show
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
  // Create error toast (temporary - will be replaced with proper UI)
  const toast = document.createElement('div')
  toast.className = 'error-toast'
  toast.textContent = message
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--color-error);
    color: white;
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    z-index: var(--z-index-toast);
    animation: slideIn 0.3s ease-out;
  `

  document.body.appendChild(toast)

  // Remove after 5 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out'
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 5000)
}

/**
 * Show notification message
 * @param {string} message - Notification message
 */
function showNotification(message) {
  // Create notification toast
  const toast = document.createElement('div')
  toast.className = 'notification-toast'
  toast.textContent = message
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--color-primary);
    color: white;
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    z-index: var(--z-index-toast);
    animation: slideIn 0.3s ease-out;
  `

  document.body.appendChild(toast)

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out'
    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast)
      }
    }, 300)
  }, 3000)
}

/**
 * Register service worker for PWA functionality
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    registerSW({
      onNeedRefresh() {
        console.warn('New content available, please refresh.')
        showNotification('New version available! Refreshing...')
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      },
      onOfflineReady() {
        console.warn('App ready to work offline')
        showNotification('App is ready for offline use!')
      },
      onRegistered(registration) {
        console.warn('Service worker registered:', registration)
      },
      onRegisterError(error) {
        console.error('Service worker registration error:', error)
      },
    })
  }
}

/**
 * Add slide-in/out animations
 */
const style = document.createElement('style')
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`
document.head.appendChild(style)

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}

// Export for debugging in development
if (import.meta.env.DEV) {
  window.__app = {
    state,
    loadData,
    showNotification,
    showError,
  }
}
