/**
 * Storage Layer
 * Wrapper for IndexedDB using localforage for event persistence
 */

import localforage from 'localforage'

/**
 * Initialize localforage with custom configuration
 */
const storage = localforage.createInstance({
  name: '24hours-db',
  storeName: 'events',
  description: 'Event storage for 24Hours day planner',
})

/**
 * Storage key constants
 */
const KEYS = {
  EVENTS: 'events',
  SETTINGS: 'settings',
  LAST_SYNC: 'lastSync',
}

/**
 * Default settings
 */
const DEFAULT_SETTINGS = {
  theme: 'light',
  notifications: true,
  firstDayOfWeek: 1, // Monday
  timeFormat: '24h',
  language: 'en',
}

/**
 * Get all events
 * @returns {Promise<Array>} Array of event objects
 */
export async function getEvents() {
  try {
    const events = await storage.getItem(KEYS.EVENTS)
    return events || []
  } catch (error) {
    console.error('Failed to get events:', error)
    return []
  }
}

/**
 * Get a single event by ID
 * @param {string} id - Event ID
 * @returns {Promise<Object|null>} Event object or null if not found
 */
export async function getEvent(id) {
  try {
    const events = await getEvents()
    return events.find((event) => event.id === id) || null
  } catch (error) {
    console.error('Failed to get event:', error)
    return null
  }
}

/**
 * Get events for a specific date
 * @param {Date} date - Date to filter by
 * @returns {Promise<Array>} Array of events for that date
 */
export async function getEventsByDate(date) {
  try {
    const events = await getEvents()
    const dateString = date.toISOString().split('T')[0]

    return events.filter((event) => {
      const eventDate = new Date(event.date).toISOString().split('T')[0]
      return eventDate === dateString
    })
  } catch (error) {
    console.error('Failed to get events by date:', error)
    return []
  }
}

/**
 * Save a new event
 * @param {Object} event - Event object
 * @param {string} event.title - Event title
 * @param {number} event.startHour - Start hour (0-23)
 * @param {number} event.endHour - End hour (0-23)
 * @param {string} [event.description] - Event description
 * @param {string} [event.category] - Event category
 * @param {string} [event.color] - Event color
 * @param {Date} [event.date] - Event date (defaults to today)
 * @returns {Promise<Object>} Saved event with generated ID
 */
export async function saveEvent(event) {
  try {
    // Validate required fields
    if (!event.title || event.startHour === undefined || event.endHour === undefined) {
      throw new Error('Missing required event fields: title, startHour, endHour')
    }

    // Generate ID if not provided
    const eventWithId = {
      id: event.id || generateId(),
      title: event.title,
      startHour: event.startHour,
      endHour: event.endHour,
      description: event.description || '',
      category: event.category || 'general',
      color: event.color || '#4F46E5',
      date: event.date || new Date().toISOString(),
      createdAt: event.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const events = await getEvents()
    const existingIndex = events.findIndex((e) => e.id === eventWithId.id)

    if (existingIndex >= 0) {
      // Update existing event
      events[existingIndex] = eventWithId
    } else {
      // Add new event
      events.push(eventWithId)
    }

    await storage.setItem(KEYS.EVENTS, events)
    return eventWithId
  } catch (error) {
    console.error('Failed to save event:', error)
    throw error
  }
}

/**
 * Update an existing event
 * @param {string} id - Event ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated event or null if not found
 */
export async function updateEvent(id, updates) {
  try {
    const events = await getEvents()
    const eventIndex = events.findIndex((e) => e.id === id)

    if (eventIndex === -1) {
      console.warn(`Event with id ${id} not found`)
      return null
    }

    // Merge updates with existing event
    events[eventIndex] = {
      ...events[eventIndex],
      ...updates,
      id, // Ensure ID cannot be changed
      updatedAt: new Date().toISOString(),
    }

    await storage.setItem(KEYS.EVENTS, events)
    return events[eventIndex]
  } catch (error) {
    console.error('Failed to update event:', error)
    throw error
  }
}

/**
 * Delete an event
 * @param {string} id - Event ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function deleteEvent(id) {
  try {
    const events = await getEvents()
    const filteredEvents = events.filter((e) => e.id !== id)

    if (filteredEvents.length === events.length) {
      console.warn(`Event with id ${id} not found`)
      return false
    }

    await storage.setItem(KEYS.EVENTS, filteredEvents)
    return true
  } catch (error) {
    console.error('Failed to delete event:', error)
    throw error
  }
}

/**
 * Delete all events
 * @returns {Promise<void>}
 */
export async function clearAllEvents() {
  try {
    await storage.setItem(KEYS.EVENTS, [])
  } catch (error) {
    console.error('Failed to clear events:', error)
    throw error
  }
}

/**
 * Get user settings
 * @returns {Promise<Object>} Settings object
 */
export async function getSettings() {
  try {
    const settings = await storage.getItem(KEYS.SETTINGS)
    return { ...DEFAULT_SETTINGS, ...settings }
  } catch (error) {
    console.error('Failed to get settings:', error)
    return DEFAULT_SETTINGS
  }
}

/**
 * Update user settings
 * @param {Object} updates - Settings to update
 * @returns {Promise<Object>} Updated settings
 */
export async function updateSettings(updates) {
  try {
    const currentSettings = await getSettings()
    const newSettings = { ...currentSettings, ...updates }
    await storage.setItem(KEYS.SETTINGS, newSettings)
    return newSettings
  } catch (error) {
    console.error('Failed to update settings:', error)
    throw error
  }
}

/**
 * Get last sync timestamp
 * @returns {Promise<Date|null>} Last sync date or null
 */
export async function getLastSync() {
  try {
    const timestamp = await storage.getItem(KEYS.LAST_SYNC)
    return timestamp ? new Date(timestamp) : null
  } catch (error) {
    console.error('Failed to get last sync:', error)
    return null
  }
}

/**
 * Update last sync timestamp
 * @returns {Promise<void>}
 */
export async function updateLastSync() {
  try {
    await storage.setItem(KEYS.LAST_SYNC, new Date().toISOString())
  } catch (error) {
    console.error('Failed to update last sync:', error)
    throw error
  }
}

/**
 * Clear all data (events, settings, etc.)
 * @returns {Promise<void>}
 */
export async function clearAllData() {
  try {
    await storage.clear()
  } catch (error) {
    console.error('Failed to clear all data:', error)
    throw error
  }
}

/**
 * Generate a unique ID for events
 * @returns {string} Unique ID
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Export all data (for backup)
 * @returns {Promise<Object>} All data as JSON object
 */
export async function exportData() {
  try {
    const events = await getEvents()
    const settings = await getSettings()
    const lastSync = await getLastSync()

    return {
      events,
      settings,
      lastSync,
      exportedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Failed to export data:', error)
    throw error
  }
}

/**
 * Import data (from backup)
 * @param {Object} data - Data to import
 * @param {boolean} [merge=false] - If true, merge with existing data
 * @returns {Promise<void>}
 */
export async function importData(data, merge = false) {
  try {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid import data')
    }

    if (merge) {
      // Merge events (avoid duplicates)
      const existingEvents = await getEvents()
      const existingIds = new Set(existingEvents.map((e) => e.id))
      const newEvents = data.events?.filter((e) => !existingIds.has(e.id)) || []
      await storage.setItem(KEYS.EVENTS, [...existingEvents, ...newEvents])

      // Merge settings
      const existingSettings = await getSettings()
      await storage.setItem(KEYS.SETTINGS, { ...existingSettings, ...data.settings })
    } else {
      // Replace all data
      if (data.events) {
        await storage.setItem(KEYS.EVENTS, data.events)
      }
      if (data.settings) {
        await storage.setItem(KEYS.SETTINGS, data.settings)
      }
      if (data.lastSync) {
        await storage.setItem(KEYS.LAST_SYNC, data.lastSync)
      }
    }
  } catch (error) {
    console.error('Failed to import data:', error)
    throw error
  }
}
