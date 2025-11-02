/**
 * Main Entry Point
 * Initializes the 24Hours application
 */

// Import styles
import './styles/variables.css'
import './styles/main.css'
import './styles/circle.css'
import './styles/modal.css'

// Import components and utilities
import { createCircleView } from './components/CircleView.js'
import { createEventModal } from './components/EventModal.js'
import { formatDate, formatTime, getCurrentHour, getCurrentMinute } from './lib/timeUtils.js'
import {
  getEventsByDate,
  saveEvent,
  deleteEvent
} from './lib/storage.js'

// Import PWA utilities
import { registerSW } from 'virtual:pwa-register'

/**
 * Application state
 */
const state = {
  circleView: null,
  eventModal: null,
  events: [],
  currentDate: new Date(),
  isLoading: false
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
    // Load events for current date
    state.events = await getEventsByDate(state.currentDate)
  } catch (error) {
    console.error('Failed to load data:', error)
    showError('Failed to load events')
  }
}

/**
 * Initialize UI components
 */
function initializeUI() {
  // Initialize circle view with event click handler
  const container = document.getElementById('circle-container')
  if (container) {
    state.circleView = createCircleView(
      container,
      handleSegmentClick,
      handleEventClick
    )

    // Render initial events
    state.circleView.renderEvents(state.events)
  }

  // Initialize event modal
  state.eventModal = createEventModal(
    handleSaveEvent,
    handleCancelEvent,
    handleDeleteEvent,
    state.events
  )

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
 * Handle circle segment click - opens modal for event creation
 * @param {number} hour - Clicked hour (0-23)
 */
function handleSegmentClick(hour) {
  if (!state.eventModal) return

  // Open modal with pre-filled start time
  const endHour = (hour + 1) % 24
  state.eventModal.open({
    startHour: hour,
    startMinute: 0,
    endHour: endHour,
    endMinute: 0
  })
}

/**
 * Handle event click - opens modal in edit mode
 * @param {Object} event - Event object to edit
 */
function handleEventClick(event) {
  if (!state.eventModal) return

  // Open modal in edit mode with event data
  state.eventModal.open(event)
}

/**
 * Handle add event button click
 */
function handleAddEvent() {
  if (!state.eventModal) return

  const currentHour = getCurrentHour()
  const currentMinute = getCurrentMinute()
  const endHour = currentMinute >= 30 ? (currentHour + 1) % 24 : currentHour
  const endMinute = currentMinute >= 30 ? 0 : 30

  // Open modal with current time
  state.eventModal.open({
    startHour: currentHour,
    startMinute: currentMinute,
    endHour: endHour,
    endMinute: endMinute
  })
}

/**
 * Handle save event (create or update)
 * @param {Object} eventData - Event data from modal
 */
async function handleSaveEvent(eventData) {
  try {
    showLoading(true)

    // Add current date to event
    eventData.date = state.currentDate.toISOString()

    // Save to storage
    const savedEvent = await saveEvent(eventData)

    // Reload events
    await loadData()

    // Re-render events in circle
    if (state.circleView) {
      state.circleView.renderEvents(state.events)
    }

    showNotification(
      eventData.id ? 'Event updated successfully!' : 'Event created successfully!'
    )
  } catch (error) {
    console.error('Failed to save event:', error)
    showError(error.message || 'Failed to save event')
  } finally {
    showLoading(false)
  }
}

/**
 * Handle cancel event modal
 */
function handleCancelEvent() {
  // Clear any highlights
  if (state.circleView) {
    state.circleView.clearHighlights()
  }
}

/**
 * Handle delete event
 * @param {string} eventId - Event ID to delete
 */
async function handleDeleteEvent(eventId) {
  try {
    showLoading(true)

    // Delete from storage
    await deleteEvent(eventId)

    // Reload events
    await loadData()

    // Re-render events in circle
    if (state.circleView) {
      state.circleView.renderEvents(state.events)
    }

    showNotification('Event deleted successfully!')
  } catch (error) {
    console.error('Failed to delete event:', error)
    showError('Failed to delete event')
  } finally {
    showLoading(false)
  }
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
