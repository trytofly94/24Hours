/**
 * EventModal Component
 * Modal dialog for creating and editing events using native HTML5 <dialog> element
 */

import { formatTime, eventsOverlap } from '../lib/timeUtils.js'

/**
 * Category configurations with default colors
 */
const CATEGORIES = {
  work: { label: 'Work', color: '#4F46E5' },
  personal: { label: 'Personal', color: '#10B981' },
  meeting: { label: 'Meeting', color: '#F59E0B' },
  break: { label: 'Break', color: '#06B6D4' },
  other: { label: 'Other', color: '#8B5CF6' }
}

/**
 * Create and manage an event modal dialog
 * @param {Function} onSave - Callback when event is saved (eventData) => void
 * @param {Function} onCancel - Callback when modal is cancelled () => void
 * @param {Function} onDelete - Callback when event is deleted (eventId) => void
 * @param {Array} existingEvents - Array of existing events for overlap validation
 * @returns {Object} Modal API with open() and close() methods
 */
export function createEventModal(onSave, onCancel, onDelete, existingEvents = []) {
  const dialog = document.createElement('dialog')
  dialog.className = 'event-modal'
  dialog.setAttribute('data-testid', 'event-modal')

  let currentEventId = null
  let isEditMode = false

  // Build modal HTML structure
  dialog.innerHTML = `
    <div class="event-modal__container">
      <div class="event-modal__header">
        <h2 class="event-modal__title" id="modal-title">Create Event</h2>
        <button class="event-modal__close" type="button" aria-label="Close dialog">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <form class="event-modal__form" id="event-form">
        <div class="event-modal__field">
          <label class="event-modal__label" for="event-title">
            Title <span class="event-modal__required">*</span>
          </label>
          <input
            type="text"
            id="event-title"
            name="title"
            class="event-modal__input"
            required
            placeholder="Enter event title"
            maxlength="100"
          />
        </div>

        <div class="event-modal__field-group">
          <div class="event-modal__field">
            <label class="event-modal__label" for="event-start">
              Start Time <span class="event-modal__required">*</span>
            </label>
            <input
              type="time"
              id="event-start"
              name="startTime"
              class="event-modal__input"
              required
            />
          </div>

          <div class="event-modal__field">
            <label class="event-modal__label" for="event-end">
              End Time <span class="event-modal__required">*</span>
            </label>
            <input
              type="time"
              id="event-end"
              name="endTime"
              class="event-modal__input"
              required
            />
          </div>
        </div>

        <div class="event-modal__field">
          <label class="event-modal__label" for="event-description">
            Description
          </label>
          <textarea
            id="event-description"
            name="description"
            class="event-modal__textarea"
            placeholder="Add details about this event"
            rows="3"
            maxlength="500"
          ></textarea>
        </div>

        <div class="event-modal__field-group">
          <div class="event-modal__field">
            <label class="event-modal__label" for="event-category">
              Category
            </label>
            <select
              id="event-category"
              name="category"
              class="event-modal__select"
            >
              ${Object.entries(CATEGORIES)
                .map(
                  ([key, { label }]) =>
                    `<option value="${key}">${label}</option>`
                )
                .join('')}
            </select>
          </div>

          <div class="event-modal__field">
            <label class="event-modal__label" for="event-color">
              Color
            </label>
            <input
              type="color"
              id="event-color"
              name="color"
              class="event-modal__color-input"
              value="${CATEGORIES.work.color}"
            />
          </div>
        </div>

        <div class="event-modal__error" id="form-error" role="alert"></div>

        <div class="event-modal__actions">
          <button
            type="button"
            class="event-modal__button event-modal__button--secondary"
            id="cancel-button"
          >
            Cancel
          </button>
          <button
            type="button"
            class="event-modal__button event-modal__button--danger"
            id="delete-button"
            style="display: none;"
          >
            Delete
          </button>
          <button
            type="submit"
            class="event-modal__button event-modal__button--primary"
            id="save-button"
          >
            Save Event
          </button>
        </div>
      </form>
    </div>
  `

  // Append to body
  document.body.appendChild(dialog)

  // Get form elements
  const form = dialog.querySelector('#event-form')
  const titleInput = dialog.querySelector('#event-title')
  const startInput = dialog.querySelector('#event-start')
  const endInput = dialog.querySelector('#event-end')
  const descriptionInput = dialog.querySelector('#event-description')
  const categorySelect = dialog.querySelector('#event-category')
  const colorInput = dialog.querySelector('#event-color')
  const errorDiv = dialog.querySelector('#form-error')
  const modalTitle = dialog.querySelector('#modal-title')
  const closeButton = dialog.querySelector('.event-modal__close')
  const cancelButton = dialog.querySelector('#cancel-button')
  const saveButton = dialog.querySelector('#save-button')
  const deleteButton = dialog.querySelector('#delete-button')

  /**
   * Parse time string (HH:MM) to hour and minute
   * @param {string} timeString - Time in HH:MM format
   * @returns {{hour: number, minute: number}}
   */
  function parseTime(timeString) {
    const [hour, minute] = timeString.split(':').map(Number)
    return { hour, minute }
  }

  /**
   * Show error message
   * @param {string} message - Error message to display
   */
  function showError(message) {
    errorDiv.textContent = message
    errorDiv.style.display = 'block'
  }

  /**
   * Clear error message
   */
  function clearError() {
    errorDiv.textContent = ''
    errorDiv.style.display = 'none'
  }

  /**
   * Validate form and check for overlaps
   * @returns {boolean} True if valid
   */
  function validateForm() {
    clearError()

    // Check if title is empty
    if (!titleInput.value.trim()) {
      showError('Please enter an event title')
      return false
    }

    // Parse times
    const startTime = parseTime(startInput.value)
    const endTime = parseTime(endInput.value)

    // Check if end time is after start time
    const startMinutes = startTime.hour * 60 + startTime.minute
    const endMinutes = endTime.hour * 60 + endTime.minute

    if (endMinutes <= startMinutes) {
      showError('End time must be after start time')
      return false
    }

    // Check for overlaps with existing events
    const newEvent = {
      startHour: startTime.hour,
      startMinute: startTime.minute,
      endHour: endTime.hour,
      endMinute: endTime.minute
    }

    // Filter out current event if in edit mode
    const eventsToCheck = existingEvents.filter(
      (e) => !isEditMode || e.id !== currentEventId
    )

    for (const existingEvent of eventsToCheck) {
      if (eventsOverlap(newEvent, existingEvent)) {
        showError(
          `This event overlaps with "${existingEvent.title}" (${formatTime(existingEvent.startHour, existingEvent.startMinute)} - ${formatTime(existingEvent.endHour, existingEvent.endMinute)})`
        )
        return false
      }
    }

    return true
  }

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  function handleSubmit(e) {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const startTime = parseTime(startInput.value)
    const endTime = parseTime(endInput.value)

    const eventData = {
      id: currentEventId,
      title: titleInput.value.trim(),
      startHour: startTime.hour,
      startMinute: startTime.minute,
      endHour: endTime.hour,
      endMinute: endTime.minute,
      description: descriptionInput.value.trim(),
      category: categorySelect.value,
      color: colorInput.value
    }

    onSave(eventData)
    close()
  }

  /**
   * Handle delete button click
   */
  function handleDelete() {
    if (!currentEventId) return

    const confirmed = confirm(
      'Are you sure you want to delete this event? This action cannot be undone.'
    )

    if (confirmed) {
      onDelete(currentEventId)
      close()
    }
  }

  /**
   * Handle cancel/close
   */
  function handleCancel() {
    onCancel()
    close()
  }

  /**
   * Update category color when category changes
   */
  function handleCategoryChange() {
    const selectedCategory = categorySelect.value
    const categoryColor = CATEGORIES[selectedCategory]?.color || CATEGORIES.work.color
    colorInput.value = categoryColor
  }

  // Event listeners
  form.addEventListener('submit', handleSubmit)
  closeButton.addEventListener('click', handleCancel)
  cancelButton.addEventListener('click', handleCancel)
  deleteButton.addEventListener('click', handleDelete)
  categorySelect.addEventListener('change', handleCategoryChange)

  // Close on backdrop click
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      handleCancel()
    }
  })

  // Close on Escape key
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault()
    handleCancel()
  })

  /**
   * Open the modal
   * @param {Object} [initialData] - Initial data for edit mode
   * @param {string} [initialData.id] - Event ID
   * @param {string} [initialData.title] - Event title
   * @param {number} [initialData.startHour] - Start hour
   * @param {number} [initialData.startMinute] - Start minute
   * @param {number} [initialData.endHour] - End hour
   * @param {number} [initialData.endMinute] - End minute
   * @param {string} [initialData.description] - Description
   * @param {string} [initialData.category] - Category
   * @param {string} [initialData.color] - Color
   */
  function open(initialData = null) {
    if (initialData) {
      // Edit mode
      isEditMode = true
      currentEventId = initialData.id
      modalTitle.textContent = 'Edit Event'
      deleteButton.style.display = 'block'

      titleInput.value = initialData.title || ''
      startInput.value = formatTime(initialData.startHour, initialData.startMinute || 0)
      endInput.value = formatTime(initialData.endHour, initialData.endMinute || 0)
      descriptionInput.value = initialData.description || ''
      categorySelect.value = initialData.category || 'work'
      colorInput.value = initialData.color || CATEGORIES.work.color
    } else {
      // Create mode
      isEditMode = false
      currentEventId = null
      modalTitle.textContent = 'Create Event'
      deleteButton.style.display = 'none'

      form.reset()
      clearError()

      // Set default category color
      colorInput.value = CATEGORIES.work.color
    }

    dialog.showModal()
    titleInput.focus()
  }

  /**
   * Close the modal
   */
  function close() {
    dialog.close()
    form.reset()
    clearError()
    currentEventId = null
    isEditMode = false
  }

  /**
   * Destroy the modal and remove from DOM
   */
  function destroy() {
    dialog.remove()
  }

  // Return public API
  return {
    open,
    close,
    destroy
  }
}
