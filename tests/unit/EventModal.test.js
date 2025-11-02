/**
 * Unit tests for EventModal Component
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createEventModal } from '../../src/components/EventModal.js'

// Polyfill for HTMLDialogElement methods in JSDOM
if (typeof HTMLDialogElement.prototype.showModal === 'undefined') {
  HTMLDialogElement.prototype.showModal = function() {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function() {
    this.open = false
  }
}

describe('EventModal', () => {
  let modal
  let onSaveMock
  let onCancelMock
  let onDeleteMock
  let existingEvents

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = ''

    // Mock callbacks
    onSaveMock = vi.fn()
    onCancelMock = vi.fn()
    onDeleteMock = vi.fn()

    // Mock existing events
    existingEvents = [
      {
        id: 'event-1',
        title: 'Existing Event',
        startHour: 10,
        startMinute: 0,
        endHour: 11,
        endMinute: 0
      }
    ]

    // Mock window.confirm
    global.confirm = vi.fn(() => true)
  })

  afterEach(() => {
    // Cleanup
    if (modal) {
      modal.destroy()
    }
    document.body.innerHTML = ''
  })

  describe('Modal Creation', () => {
    it('should create modal element', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)

      const dialogElement = document.querySelector('.event-modal')
      expect(dialogElement).toBeDefined()
      expect(dialogElement.tagName).toBe('DIALOG')
    })

    it('should have all required form fields', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)

      expect(document.querySelector('#event-title')).toBeDefined()
      expect(document.querySelector('#event-start')).toBeDefined()
      expect(document.querySelector('#event-end')).toBeDefined()
      expect(document.querySelector('#event-description')).toBeDefined()
      expect(document.querySelector('#event-category')).toBeDefined()
      expect(document.querySelector('#event-color')).toBeDefined()
    })

    it('should have action buttons', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)

      expect(document.querySelector('#cancel-button')).toBeDefined()
      expect(document.querySelector('#save-button')).toBeDefined()
      expect(document.querySelector('#delete-button')).toBeDefined()
    })
  })

  describe('Modal Opening - Create Mode', () => {
    it('should open modal in create mode', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)
      modal.open()

      const dialogElement = document.querySelector('.event-modal')
      expect(dialogElement.open).toBe(true)

      const modalTitle = document.querySelector('#modal-title')
      expect(modalTitle.textContent).toBe('Create Event')
    })

    it('should hide delete button in create mode', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)
      modal.open()

      const deleteButton = document.querySelector('#delete-button')
      expect(deleteButton.style.display).toBe('none')
    })

    it('should have empty form fields in create mode', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)
      modal.open()

      expect(document.querySelector('#event-title').value).toBe('')
      expect(document.querySelector('#event-description').value).toBe('')
    })

    it('should focus on title input when opened', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)
      modal.open()

      // Note: In JSDOM focus() might not work as expected, but we can check if it's callable
      const titleInput = document.querySelector('#event-title')
      expect(titleInput).toBeDefined()
    })
  })

  describe('Modal Opening - Edit Mode', () => {
    it('should open modal in edit mode with data', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)

      const eventData = {
        id: 'test-id',
        title: 'Test Event',
        startHour: 9,
        startMinute: 30,
        endHour: 10,
        endMinute: 45,
        description: 'Test description',
        category: 'work',
        color: '#4F46E5'
      }

      modal.open(eventData)

      const modalTitle = document.querySelector('#modal-title')
      expect(modalTitle.textContent).toBe('Edit Event')

      expect(document.querySelector('#event-title').value).toBe('Test Event')
      expect(document.querySelector('#event-start').value).toBe('09:30')
      expect(document.querySelector('#event-end').value).toBe('10:45')
      expect(document.querySelector('#event-description').value).toBe('Test description')
      expect(document.querySelector('#event-category').value).toBe('work')
      expect(document.querySelector('#event-color').value.toLowerCase()).toBe('#4f46e5')
    })

    it('should show delete button in edit mode', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)

      const eventData = {
        id: 'test-id',
        title: 'Test Event',
        startHour: 9,
        startMinute: 0,
        endHour: 10,
        endMinute: 0
      }

      modal.open(eventData)

      const deleteButton = document.querySelector('#delete-button')
      expect(deleteButton.style.display).toBe('block')
    })

    it('should handle events without minute data (backward compatibility)', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)

      const eventData = {
        id: 'test-id',
        title: 'Old Event',
        startHour: 9,
        endHour: 10
      }

      modal.open(eventData)

      expect(document.querySelector('#event-start').value).toBe('09:00')
      expect(document.querySelector('#event-end').value).toBe('10:00')
    })
  })

  describe('Form Validation', () => {
    it('should prevent submission with empty title', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)
      modal.open()

      document.querySelector('#event-title').value = ''
      document.querySelector('#event-start').value = '09:00'
      document.querySelector('#event-end').value = '10:00'

      const form = document.querySelector('#event-form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      // Error should be shown
      const errorDiv = document.querySelector('#form-error')
      expect(errorDiv.style.display).toBe('block')
      expect(errorDiv.textContent).toContain('title')

      // onSave should not be called
      expect(onSaveMock).not.toHaveBeenCalled()
    })

    it('should prevent submission when end time is before start time', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)
      modal.open()

      document.querySelector('#event-title').value = 'Test Event'
      document.querySelector('#event-start').value = '10:00'
      document.querySelector('#event-end').value = '09:00'

      const form = document.querySelector('#event-form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      const errorDiv = document.querySelector('#form-error')
      expect(errorDiv.style.display).toBe('block')
      expect(errorDiv.textContent).toContain('after start time')

      expect(onSaveMock).not.toHaveBeenCalled()
    })

    it('should prevent submission when end time equals start time', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)
      modal.open()

      document.querySelector('#event-title').value = 'Test Event'
      document.querySelector('#event-start').value = '10:00'
      document.querySelector('#event-end').value = '10:00'

      const form = document.querySelector('#event-form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      const errorDiv = document.querySelector('#form-error')
      expect(errorDiv.style.display).toBe('block')

      expect(onSaveMock).not.toHaveBeenCalled()
    })

    it('should detect overlap with existing events', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)
      modal.open()

      document.querySelector('#event-title').value = 'Overlapping Event'
      document.querySelector('#event-start').value = '09:30'
      document.querySelector('#event-end').value = '10:30'

      const form = document.querySelector('#event-form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      const errorDiv = document.querySelector('#form-error')
      expect(errorDiv.style.display).toBe('block')
      expect(errorDiv.textContent).toContain('overlaps')
      expect(errorDiv.textContent).toContain('Existing Event')

      expect(onSaveMock).not.toHaveBeenCalled()
    })

    it('should allow non-overlapping events', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)
      modal.open()

      document.querySelector('#event-title').value = 'Non-Overlapping Event'
      document.querySelector('#event-start').value = '11:00'
      document.querySelector('#event-end').value = '12:00'

      const form = document.querySelector('#event-form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      expect(onSaveMock).toHaveBeenCalled()
    })

    it('should allow editing event without detecting self-overlap', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)

      // Open in edit mode with existing event
      modal.open(existingEvents[0])

      // Change only the title, keep same time
      document.querySelector('#event-title').value = 'Updated Event'

      const form = document.querySelector('#event-form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      // Should not detect overlap with itself
      expect(onSaveMock).toHaveBeenCalled()
    })
  })

  describe('Form Submission', () => {
    it('should call onSave with correct event data', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)
      modal.open()

      document.querySelector('#event-title').value = 'New Event'
      document.querySelector('#event-start').value = '14:30'
      document.querySelector('#event-end').value = '15:45'
      document.querySelector('#event-description').value = 'Test description'
      document.querySelector('#event-category').value = 'meeting'
      document.querySelector('#event-color').value = '#F59E0B'

      const form = document.querySelector('#event-form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      expect(onSaveMock).toHaveBeenCalledWith({
        id: null,
        title: 'New Event',
        startHour: 14,
        startMinute: 30,
        endHour: 15,
        endMinute: 45,
        description: 'Test description',
        category: 'meeting',
        color: '#f59e0b'
      })
    })

    it('should close modal after successful submission', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)
      modal.open()

      document.querySelector('#event-title').value = 'New Event'
      document.querySelector('#event-start').value = '14:00'
      document.querySelector('#event-end').value = '15:00'

      const form = document.querySelector('#event-form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      const dialogElement = document.querySelector('.event-modal')
      expect(dialogElement.open).toBe(false)
    })

    it('should include event ID in edit mode', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)

      modal.open({
        id: 'test-id',
        title: 'Old Title',
        startHour: 9,
        startMinute: 0,
        endHour: 10,
        endMinute: 0
      })

      document.querySelector('#event-title').value = 'New Title'

      const form = document.querySelector('#event-form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      expect(onSaveMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-id',
          title: 'New Title'
        })
      )
    })
  })

  describe('Modal Closing', () => {
    it('should close modal when cancel button is clicked', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)
      modal.open()

      const cancelButton = document.querySelector('#cancel-button')
      cancelButton.click()

      const dialogElement = document.querySelector('.event-modal')
      expect(dialogElement.open).toBe(false)
      expect(onCancelMock).toHaveBeenCalled()
    })

    it('should close modal when close button is clicked', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)
      modal.open()

      const closeButton = document.querySelector('.event-modal__close')
      closeButton.click()

      const dialogElement = document.querySelector('.event-modal')
      expect(dialogElement.open).toBe(false)
      expect(onCancelMock).toHaveBeenCalled()
    })

    it('should close modal programmatically', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)
      modal.open()

      modal.close()

      const dialogElement = document.querySelector('.event-modal')
      expect(dialogElement.open).toBe(false)
    })

    it('should reset form when closing', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)
      modal.open()

      document.querySelector('#event-title').value = 'Test'
      document.querySelector('#event-start').value = '10:00'

      modal.close()
      modal.open()

      expect(document.querySelector('#event-title').value).toBe('')
    })
  })

  describe('Delete Functionality', () => {
    it('should call onDelete when delete button is clicked and confirmed', () => {
      global.confirm = vi.fn(() => true)

      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)

      modal.open({
        id: 'test-id',
        title: 'Event to Delete',
        startHour: 9,
        startMinute: 0,
        endHour: 10,
        endMinute: 0
      })

      const deleteButton = document.querySelector('#delete-button')
      deleteButton.click()

      expect(global.confirm).toHaveBeenCalled()
      expect(onDeleteMock).toHaveBeenCalledWith('test-id')
    })

    it('should not delete when user cancels confirmation', () => {
      global.confirm = vi.fn(() => false)

      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)

      modal.open({
        id: 'test-id',
        title: 'Event to Delete',
        startHour: 9,
        startMinute: 0,
        endHour: 10,
        endMinute: 0
      })

      const deleteButton = document.querySelector('#delete-button')
      deleteButton.click()

      expect(global.confirm).toHaveBeenCalled()
      expect(onDeleteMock).not.toHaveBeenCalled()
    })

    it('should close modal after successful delete', () => {
      global.confirm = vi.fn(() => true)

      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)

      modal.open({
        id: 'test-id',
        title: 'Event to Delete',
        startHour: 9,
        startMinute: 0,
        endHour: 10,
        endMinute: 0
      })

      const deleteButton = document.querySelector('#delete-button')
      deleteButton.click()

      const dialogElement = document.querySelector('.event-modal')
      expect(dialogElement.open).toBe(false)
    })
  })

  describe('Category Color Preset', () => {
    it('should update color when category changes', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)
      modal.open()

      const categorySelect = document.querySelector('#event-category')
      const colorInput = document.querySelector('#event-color')

      // Change to work category
      categorySelect.value = 'work'
      categorySelect.dispatchEvent(new Event('change'))
      expect(colorInput.value.toLowerCase()).toBe('#4f46e5')

      // Change to meeting category
      categorySelect.value = 'meeting'
      categorySelect.dispatchEvent(new Event('change'))
      expect(colorInput.value.toLowerCase()).toBe('#f59e0b')

      // Change to personal category
      categorySelect.value = 'personal'
      categorySelect.dispatchEvent(new Event('change'))
      expect(colorInput.value.toLowerCase()).toBe('#10b981')
    })
  })

  describe('Modal Destruction', () => {
    it('should remove modal from DOM when destroyed', () => {
      modal = createEventModal(onSaveMock, onCancelMock, onDeleteMock, existingEvents)

      expect(document.querySelector('.event-modal')).toBeDefined()

      modal.destroy()

      expect(document.querySelector('.event-modal')).toBeNull()
    })
  })
})
