/**
 * End-to-End Tests for Event Creation and Management
 */

import { test, expect } from '@playwright/test'

test.describe('Event Creation and Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173')

    // Wait for the circle to be visible
    await page.waitForSelector('.circle__svg', { timeout: 5000 })

    // Clear any existing events from storage
    await page.evaluate(() => {
      localStorage.clear()
      return indexedDB.deleteDatabase('24hours-db')
    })

    // Reload to start fresh
    await page.reload()
    await page.waitForSelector('.circle__svg')
  })

  test('should open event modal when clicking on a circle segment', async ({ page }) => {
    // Click on a circle segment (hour 9)
    const segment = page.locator('.circle__segment[data-hour="9"]')
    await segment.click()

    // Modal should be visible
    const modal = page.locator('.event-modal')
    await expect(modal).toBeVisible()

    // Modal title should be "Create Event"
    const modalTitle = page.locator('#modal-title')
    await expect(modalTitle).toHaveText('Create Event')

    // Start time should be pre-filled with clicked hour
    const startTimeInput = page.locator('#event-start')
    const startValue = await startTimeInput.inputValue()
    expect(startValue).toBe('09:00')
  })

  test('should create a new event with minute precision', async ({ page }) => {
    // Click on segment
    await page.locator('.circle__segment[data-hour="10"]').click()

    // Fill in event details
    await page.locator('#event-title').fill('Team Meeting')
    await page.locator('#event-start').fill('10:30')
    await page.locator('#event-end').fill('11:45')
    await page.locator('#event-description').fill('Discuss project roadmap')
    await page.locator('#event-category').selectOption('meeting')

    // Submit form
    await page.locator('#save-button').click()

    // Modal should close
    await expect(page.locator('.event-modal')).not.toBeVisible()

    // Event should be visible in the circle
    const eventArc = page.locator('.circle__event[data-event-title="Team Meeting"]')
    await expect(eventArc).toBeVisible()
  })

  test('should display event tooltip on hover', async ({ page }) => {
    // Create an event first
    await page.locator('.circle__segment[data-hour="14"]').click()
    await page.locator('#event-title').fill('Lunch Break')
    await page.locator('#event-start').fill('14:00')
    await page.locator('#event-end').fill('15:00')
    await page.locator('#event-category').selectOption('break')
    await page.locator('#save-button').click()

    // Hover over the event
    const eventArc = page.locator('.circle__event[data-event-title="Lunch Break"]')
    await eventArc.hover()

    // Tooltip should be visible
    const tooltip = page.locator('.circle__event-tooltip')
    await expect(tooltip).toBeVisible()

    // Tooltip should contain event details
    await expect(tooltip).toContainText('Lunch Break')
    await expect(tooltip).toContainText('14:00')
    await expect(tooltip).toContainText('15:00')
  })

  test('should edit an existing event', async ({ page }) => {
    // Create an event
    await page.locator('.circle__segment[data-hour="9"]').click()
    await page.locator('#event-title').fill('Morning Standup')
    await page.locator('#event-start').fill('09:00')
    await page.locator('#event-end').fill('09:30')
    await page.locator('#save-button').click()

    // Click on the event to edit it
    const eventArc = page.locator('.circle__event[data-event-title="Morning Standup"]')
    await eventArc.click()

    // Modal should open in edit mode
    await expect(page.locator('#modal-title')).toHaveText('Edit Event')

    // Delete button should be visible
    await expect(page.locator('#delete-button')).toBeVisible()

    // Modify the event
    await page.locator('#event-title').fill('Daily Standup')
    await page.locator('#event-end').fill('09:45')

    // Save changes
    await page.locator('#save-button').click()

    // Updated event should be visible
    await expect(page.locator('.circle__event[data-event-title="Daily Standup"]')).toBeVisible()
    await expect(page.locator('.circle__event[data-event-title="Morning Standup"]')).not.toBeVisible()
  })

  test('should delete an event', async ({ page }) => {
    // Create an event
    await page.locator('.circle__segment[data-hour="16"]').click()
    await page.locator('#event-title').fill('Event to Delete')
    await page.locator('#event-start').fill('16:00')
    await page.locator('#event-end').fill('17:00')
    await page.locator('#save-button').click()

    // Verify event exists
    await expect(page.locator('.circle__event[data-event-title="Event to Delete"]')).toBeVisible()

    // Click on event to edit
    await page.locator('.circle__event[data-event-title="Event to Delete"]').click()

    // Setup dialog handler for confirmation
    page.on('dialog', dialog => dialog.accept())

    // Click delete button
    await page.locator('#delete-button').click()

    // Event should be removed
    await expect(page.locator('.circle__event[data-event-title="Event to Delete"]')).not.toBeVisible()
  })

  test('should prevent overlapping events', async ({ page }) => {
    // Create first event
    await page.locator('.circle__segment[data-hour="10"]').click()
    await page.locator('#event-title').fill('First Event')
    await page.locator('#event-start').fill('10:00')
    await page.locator('#event-end').fill('11:00')
    await page.locator('#save-button').click()

    // Try to create overlapping event
    await page.locator('.circle__segment[data-hour="10"]').click()
    await page.locator('#event-title').fill('Overlapping Event')
    await page.locator('#event-start').fill('10:30')
    await page.locator('#event-end').fill('11:30')
    await page.locator('#save-button').click()

    // Error message should be displayed
    const errorDiv = page.locator('#form-error')
    await expect(errorDiv).toBeVisible()
    await expect(errorDiv).toContainText('overlaps')
    await expect(errorDiv).toContainText('First Event')

    // Modal should still be open
    await expect(page.locator('.event-modal')).toBeVisible()
  })

  test('should validate end time is after start time', async ({ page }) => {
    await page.locator('.circle__segment[data-hour="12"]').click()

    await page.locator('#event-title').fill('Invalid Time Event')
    await page.locator('#event-start').fill('12:00')
    await page.locator('#event-end').fill('11:00')

    await page.locator('#save-button').click()

    // Error should be shown
    const errorDiv = page.locator('#form-error')
    await expect(errorDiv).toBeVisible()
    await expect(errorDiv).toContainText('after start time')
  })

  test('should require event title', async ({ page }) => {
    await page.locator('.circle__segment[data-hour="13"]').click()

    // Leave title empty
    await page.locator('#event-start').fill('13:00')
    await page.locator('#event-end').fill('14:00')

    await page.locator('#save-button').click()

    // Error should be shown
    const errorDiv = page.locator('#form-error')
    await expect(errorDiv).toBeVisible()
    await expect(errorDiv).toContainText('title')
  })

  test('should persist events after page reload', async ({ page }) => {
    // Create an event
    await page.locator('.circle__segment[data-hour="8"]').click()
    await page.locator('#event-title').fill('Persistent Event')
    await page.locator('#event-start').fill('08:00')
    await page.locator('#event-end').fill('09:00')
    await page.locator('#save-button').click()

    // Verify event is visible
    await expect(page.locator('.circle__event[data-event-title="Persistent Event"]')).toBeVisible()

    // Reload page
    await page.reload()
    await page.waitForSelector('.circle__svg')

    // Event should still be visible
    await expect(page.locator('.circle__event[data-event-title="Persistent Event"]')).toBeVisible()
  })

  test('should close modal when clicking cancel button', async ({ page }) => {
    await page.locator('.circle__segment[data-hour="15"]').click()

    await page.locator('#event-title').fill('Cancelled Event')
    await page.locator('#cancel-button').click()

    // Modal should close
    await expect(page.locator('.event-modal')).not.toBeVisible()

    // No event should be created
    await expect(page.locator('.circle__event[data-event-title="Cancelled Event"]')).not.toBeVisible()
  })

  test('should close modal when clicking close button (X)', async ({ page }) => {
    await page.locator('.circle__segment[data-hour="15"]').click()

    await page.locator('#event-title').fill('Another Cancelled Event')

    // Click the X button
    await page.locator('.event-modal__close').click()

    // Modal should close
    await expect(page.locator('.event-modal')).not.toBeVisible()
  })

  test('should allow creating adjacent events (no gap)', async ({ page }) => {
    // Create first event
    await page.locator('.circle__segment[data-hour="9"]').click()
    await page.locator('#event-title').fill('Event 1')
    await page.locator('#event-start').fill('09:00')
    await page.locator('#event-end').fill('10:00')
    await page.locator('#save-button').click()

    // Create adjacent event (no overlap)
    await page.locator('.circle__segment[data-hour="10"]').click()
    await page.locator('#event-title').fill('Event 2')
    await page.locator('#event-start').fill('10:00')
    await page.locator('#event-end').fill('11:00')
    await page.locator('#save-button').click()

    // Both events should be visible
    await expect(page.locator('.circle__event[data-event-title="Event 1"]')).toBeVisible()
    await expect(page.locator('.circle__event[data-event-title="Event 2"]')).toBeVisible()
  })

  test('should handle minute-level event precision', async ({ page }) => {
    await page.locator('.circle__segment[data-hour="11"]').click()

    await page.locator('#event-title').fill('Short Meeting')
    await page.locator('#event-start').fill('11:15')
    await page.locator('#event-end').fill('11:45')
    await page.locator('#save-button').click()

    // Event should be created with minute precision
    const eventArc = page.locator('.circle__event[data-event-title="Short Meeting"]')
    await expect(eventArc).toBeVisible()

    // Verify in tooltip
    await eventArc.hover()
    const tooltip = page.locator('.circle__event-tooltip')
    await expect(tooltip).toContainText('11:15')
    await expect(tooltip).toContainText('11:45')
  })

  test('should update category color when category changes', async ({ page }) => {
    await page.locator('.circle__segment[data-hour="13"]').click()

    // Select different categories and check color updates
    const colorInput = page.locator('#event-color')
    const categorySelect = page.locator('#event-category')

    await categorySelect.selectOption('work')
    await expect(colorInput).toHaveValue('#4F46E5')

    await categorySelect.selectOption('meeting')
    await expect(colorInput).toHaveValue('#F59E0B')

    await categorySelect.selectOption('personal')
    await expect(colorInput).toHaveValue('#10B981')

    await categorySelect.selectOption('break')
    await expect(colorInput).toHaveValue('#06B6D4')
  })

  test('should handle events crossing midnight', async ({ page }) => {
    await page.locator('.circle__segment[data-hour="23"]').click()

    await page.locator('#event-title').fill('Night Event')
    await page.locator('#event-start').fill('23:30')
    await page.locator('#event-end').fill('00:30')
    await page.locator('#save-button').click()

    // Event should be created
    await expect(page.locator('.circle__event[data-event-title="Night Event"]')).toBeVisible()
  })
})
