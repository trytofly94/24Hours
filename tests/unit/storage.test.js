/**
 * Unit tests for storage
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import localforage from 'localforage'

// Mock localforage
vi.mock('localforage', () => {
  const store = new Map()
  return {
    default: {
      createInstance: () => ({
        getItem: vi.fn((key) => Promise.resolve(store.get(key))),
        setItem: vi.fn((key, value) => {
          store.set(key, value)
          return Promise.resolve(value)
        }),
        removeItem: vi.fn((key) => {
          store.delete(key)
          return Promise.resolve()
        }),
        clear: vi.fn(() => {
          store.clear()
          return Promise.resolve()
        }),
      }),
      _store: store, // Expose for test access
    },
  }
})

// Import after mocking
import {
  getEvents,
  getEvent,
  saveEvent,
  updateEvent,
  deleteEvent,
  clearAllEvents,
  getSettings,
  updateSettings,
  exportData,
  importData,
} from '../../src/lib/storage.js'

describe('storage', () => {
  beforeEach(async () => {
    // Clear store before each test
    localforage._store.clear()
  })

  describe('getEvents', () => {
    it('should return empty array when no events exist', async () => {
      const events = await getEvents()
      expect(events).toEqual([])
    })

    it('should return events from storage', async () => {
      const mockEvents = [
        { id: '1', title: 'Event 1', startHour: 9, endHour: 10 },
      ]
      localforage._store.set('events', mockEvents)

      const events = await getEvents()
      expect(events).toEqual(mockEvents)
    })
  })

  describe('getEvent', () => {
    it('should return null for non-existent event', async () => {
      const event = await getEvent('non-existent')
      expect(event).toBeNull()
    })

    it('should return specific event by ID', async () => {
      const mockEvents = [
        { id: '1', title: 'Event 1', startHour: 9, endHour: 10 },
        { id: '2', title: 'Event 2', startHour: 11, endHour: 12 },
      ]
      localforage._store.set('events', mockEvents)

      const event = await getEvent('2')
      expect(event).toEqual(mockEvents[1])
    })
  })

  describe('saveEvent', () => {
    it('should save new event with generated ID', async () => {
      const newEvent = {
        title: 'Test Event',
        startHour: 9,
        endHour: 10,
      }

      const saved = await saveEvent(newEvent)

      expect(saved.id).toBeDefined()
      expect(saved.title).toBe('Test Event')
      expect(saved.startHour).toBe(9)
      expect(saved.endHour).toBe(10)
      expect(saved.createdAt).toBeDefined()
      expect(saved.updatedAt).toBeDefined()
    })

    it('should save event with default values', async () => {
      const newEvent = {
        title: 'Test Event',
        startHour: 9,
        endHour: 10,
      }

      const saved = await saveEvent(newEvent)

      expect(saved.description).toBe('')
      expect(saved.category).toBe('general')
      expect(saved.color).toBe('#4F46E5')
    })

    it('should throw error for missing required fields', async () => {
      await expect(saveEvent({})).rejects.toThrow()
      await expect(saveEvent({ title: 'Test' })).rejects.toThrow()
      await expect(saveEvent({ startHour: 9 })).rejects.toThrow()
    })

    it('should update existing event with same ID', async () => {
      const event = {
        id: 'test-id',
        title: 'Original',
        startHour: 9,
        endHour: 10,
      }

      await saveEvent(event)

      const updated = {
        id: 'test-id',
        title: 'Updated',
        startHour: 9,
        endHour: 10,
      }

      await saveEvent(updated)

      const events = await getEvents()
      expect(events).toHaveLength(1)
      expect(events[0].title).toBe('Updated')
    })
  })

  describe('updateEvent', () => {
    it('should update existing event', async () => {
      const event = {
        id: 'test-id',
        title: 'Original',
        startHour: 9,
        endHour: 10,
      }

      await saveEvent(event)

      const updated = await updateEvent('test-id', { title: 'Updated' })

      expect(updated.title).toBe('Updated')
      expect(updated.startHour).toBe(9) // Unchanged
      expect(updated.updatedAt).toBeDefined()
    })

    it('should return null for non-existent event', async () => {
      const result = await updateEvent('non-existent', { title: 'Updated' })
      expect(result).toBeNull()
    })

    it('should not allow changing ID', async () => {
      const event = {
        id: 'original-id',
        title: 'Test',
        startHour: 9,
        endHour: 10,
      }

      await saveEvent(event)

      const updated = await updateEvent('original-id', { id: 'new-id' })

      expect(updated.id).toBe('original-id')
    })
  })

  describe('deleteEvent', () => {
    it('should delete existing event', async () => {
      const event = {
        id: 'test-id',
        title: 'Test',
        startHour: 9,
        endHour: 10,
      }

      await saveEvent(event)

      const result = await deleteEvent('test-id')
      expect(result).toBe(true)

      const events = await getEvents()
      expect(events).toHaveLength(0)
    })

    it('should return false for non-existent event', async () => {
      const result = await deleteEvent('non-existent')
      expect(result).toBe(false)
    })
  })

  describe('clearAllEvents', () => {
    it('should clear all events', async () => {
      await saveEvent({ title: 'Event 1', startHour: 9, endHour: 10 })
      await saveEvent({ title: 'Event 2', startHour: 11, endHour: 12 })

      await clearAllEvents()

      const events = await getEvents()
      expect(events).toHaveLength(0)
    })
  })

  describe('getSettings', () => {
    it('should return default settings when none exist', async () => {
      const settings = await getSettings()

      expect(settings.theme).toBe('light')
      expect(settings.notifications).toBe(true)
      expect(settings.timeFormat).toBe('24h')
    })

    it('should merge stored settings with defaults', async () => {
      localforage._store.set('settings', { theme: 'dark' })

      const settings = await getSettings()

      expect(settings.theme).toBe('dark')
      expect(settings.notifications).toBe(true) // Default
    })
  })

  describe('updateSettings', () => {
    it('should update settings', async () => {
      const updated = await updateSettings({ theme: 'dark' })

      expect(updated.theme).toBe('dark')
      expect(updated.notifications).toBe(true) // Preserved default
    })

    it('should merge with existing settings', async () => {
      await updateSettings({ theme: 'dark' })
      await updateSettings({ notifications: false })

      const settings = await getSettings()

      expect(settings.theme).toBe('dark')
      expect(settings.notifications).toBe(false)
    })
  })

  describe('exportData', () => {
    it('should export all data', async () => {
      await saveEvent({ title: 'Event 1', startHour: 9, endHour: 10 })
      await updateSettings({ theme: 'dark' })

      const data = await exportData()

      expect(data.events).toHaveLength(1)
      expect(data.settings.theme).toBe('dark')
      expect(data.exportedAt).toBeDefined()
    })
  })

  describe('importData', () => {
    it('should import data (replace mode)', async () => {
      const importData1 = {
        events: [
          { id: '1', title: 'Imported Event', startHour: 9, endHour: 10 },
        ],
        settings: { theme: 'dark' },
      }

      await importData(importData1, false)

      const events = await getEvents()
      const settings = await getSettings()

      expect(events).toHaveLength(1)
      expect(events[0].title).toBe('Imported Event')
      expect(settings.theme).toBe('dark')
    })

    it('should import data (merge mode)', async () => {
      await saveEvent({
        id: '1',
        title: 'Existing Event',
        startHour: 9,
        endHour: 10,
      })

      const importData1 = {
        events: [
          { id: '2', title: 'Imported Event', startHour: 11, endHour: 12 },
        ],
        settings: { theme: 'dark' },
      }

      await importData(importData1, true)

      const events = await getEvents()
      expect(events).toHaveLength(2)
    })

    it('should throw error for invalid data', async () => {
      await expect(importData(null)).rejects.toThrow()
      await expect(importData('invalid')).rejects.toThrow()
    })
  })
})
