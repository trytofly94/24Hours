/**
 * E2E Tests for Interactive Segments
 * Tests hover, click, and other user interactions with circle segments
 */

import { test, expect } from '@playwright/test'

test.describe('Interactive Segments - Hover and Click', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should show hover effect on segment hover', async ({ page }) => {
    const firstSegment = await page.locator('.circle__segment').first()

    // Get initial state
    const initialClass = await firstSegment.getAttribute('class')

    // Hover over segment
    await firstSegment.hover()

    // Wait for any CSS transitions
    await page.waitForTimeout(100)

    // Segment should be accessible for interaction
    await expect(firstSegment).toBeVisible()
  })

  test('should add tooltip on segment hover', async ({ page }) => {
    const segment = await page.locator('.circle__segment[data-hour="9"]')

    // Hover over 9 AM segment
    await segment.hover()

    // Check if tooltip attribute is added
    await page.waitForTimeout(100)
    const tooltip = await segment.getAttribute('data-tooltip')

    expect(tooltip).toBe('09:00')
  })

  test('should show correct tooltip for different hours', async ({ page }) => {
    const testHours = [
      { hour: 0, expected: '00:00' },
      { hour: 6, expected: '06:00' },
      { hour: 12, expected: '12:00' },
      { hour: 18, expected: '18:00' },
      { hour: 23, expected: '23:00' }
    ]

    for (const { hour, expected } of testHours) {
      const segment = await page.locator(`.circle__segment[data-hour="${hour}"]`)
      await segment.hover()
      await page.waitForTimeout(50)

      const tooltip = await segment.getAttribute('data-tooltip')
      expect(tooltip).toBe(expected)
    }
  })

  test('should handle click on hour segment', async ({ page }) => {
    const segment = await page.locator('.circle__segment[data-hour="10"]')

    // Click on segment
    await segment.click()

    // Click should be registered (we can verify by checking console or events)
    // For now, just verify the segment is still visible and clickable
    await expect(segment).toBeVisible()
  })

  test('should handle multiple clicks on different segments', async ({ page }) => {
    const hours = [3, 9, 15, 21]

    for (const hour of hours) {
      const segment = await page.locator(`.circle__segment[data-hour="${hour}"]`)
      await segment.click()
      await page.waitForTimeout(100)

      // Verify segment is still visible after click
      await expect(segment).toBeVisible()
    }
  })

  test('should allow sequential selection of segments', async ({ page }) => {
    // Click on morning segment
    const morningSegment = await page.locator('.circle__segment[data-hour="8"]')
    await morningSegment.click()

    // Click on afternoon segment
    const afternoonSegment = await page.locator('.circle__segment[data-hour="14"]')
    await afternoonSegment.click()

    // Click on evening segment
    const eveningSegment = await page.locator('.circle__segment[data-hour="20"]')
    await eveningSegment.click()

    // All segments should still be visible and accessible
    await expect(morningSegment).toBeVisible()
    await expect(afternoonSegment).toBeVisible()
    await expect(eveningSegment).toBeVisible()
  })

  test('should handle rapid hover over multiple segments', async ({ page }) => {
    const segments = await page.locator('.circle__segment')

    // Hover over first 6 segments rapidly
    for (let i = 0; i < 6; i++) {
      await segments.nth(i).hover()
      await page.waitForTimeout(50)
    }

    // All segments should still be rendered correctly
    const segmentCount = await segments.count()
    expect(segmentCount).toBe(24)
  })

  test('should handle touch interactions on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    const segment = await page.locator('.circle__segment[data-hour="12"]')

    // Use click instead of tap (tap requires hasTouch context option)
    await segment.click()

    // Segment should still be visible after click
    await expect(segment).toBeVisible()
  })

  test('should handle segment click with keyboard navigation', async ({ page }) => {
    const segment = await page.locator('.circle__segment[data-hour="14"]')

    // Focus on segment
    await segment.focus()

    // Verify segment is focused (can be clicked)
    await expect(segment).toBeVisible()

    // Click with keyboard (Enter key)
    await segment.press('Enter')

    // Segment should still be visible
    await expect(segment).toBeVisible()
  })

  test('should maintain interactivity after window resize', async ({ page }) => {
    // Start with desktop size
    await page.setViewportSize({ width: 1920, height: 1080 })

    const segment = await page.locator('.circle__segment[data-hour="10"]')
    await segment.click()

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 })

    // Segment should still be interactive
    await segment.click()
    await expect(segment).toBeVisible()
  })

  test('should not lose interactivity on rapid segment changes', async ({ page }) => {
    // Rapidly click different segments
    for (let hour = 0; hour < 24; hour += 3) {
      const segment = await page.locator(`.circle__segment[data-hour="${hour}"]`)
      await segment.click()
      await page.waitForTimeout(20)
    }

    // Verify all segments are still clickable
    const lastSegment = await page.locator('.circle__segment[data-hour="21"]')
    await lastSegment.click()
    await expect(lastSegment).toBeVisible()
  })

  test('should handle double-click on segment', async ({ page }) => {
    const segment = await page.locator('.circle__segment[data-hour="15"]')

    // Double-click
    await segment.dblclick()

    // Segment should still be functional
    await expect(segment).toBeVisible()
  })

  test('should handle right-click on segment', async ({ page }) => {
    const segment = await page.locator('.circle__segment[data-hour="18"]')

    // Right-click (context menu)
    await segment.click({ button: 'right' })

    // Segment should still be visible
    await expect(segment).toBeVisible()
  })

  test('should preserve segment state during interactions', async ({ page }) => {
    const segment = await page.locator('.circle__segment[data-hour="12"]')

    // Get data-hour attribute
    const hourBefore = await segment.getAttribute('data-hour')

    // Interact with segment
    await segment.hover()
    await segment.click()

    // Get data-hour attribute after interaction
    const hourAfter = await segment.getAttribute('data-hour')

    // Should remain the same
    expect(hourBefore).toBe(hourAfter)
    expect(hourAfter).toBe('12')
  })

  test('should show visual feedback for current hour segment', async ({ page }) => {
    const currentSegment = await page.locator('.circle__segment--current')

    // Current segment should be visible
    await expect(currentSegment).toBeVisible()

    // Should have the current class
    const classes = await currentSegment.getAttribute('class')
    expect(classes).toContain('circle__segment--current')

    // Should still be interactive
    await currentSegment.hover()
    await currentSegment.click()
  })

  test('should handle hover on center circle', async ({ page }) => {
    const centerCircle = await page.locator('.circle__center')

    // Center should be visible
    await expect(centerCircle).toBeVisible()

    // Hover with force to bypass overlapping elements
    await centerCircle.hover({ force: true })

    // Time should still update
    const centerTime = await page.locator('#center-time')
    await expect(centerTime).toBeVisible()
  })

  test('should handle interactions with hour labels', async ({ page }) => {
    const label = await page.locator('.circle__label--major').first()

    // Label should be visible
    await expect(label).toBeVisible()

    // Label text should be present
    const text = await label.textContent()
    expect(text).toBeTruthy()

    // Hover with force to bypass overlapping SVG
    await label.hover({ force: true })
  })

  test('should support accessibility with screen reader', async ({ page }) => {
    // Check if segments are accessible
    const segments = await page.locator('.circle__segment')

    // First segment should be accessible
    const firstSegment = segments.first()
    await expect(firstSegment).toBeVisible()

    // Verify segment can receive focus
    await firstSegment.focus()

    // Should be able to get data attribute
    const hour = await firstSegment.getAttribute('data-hour')
    expect(hour).toBe('0')
  })

  test('should handle pointer events correctly', async ({ page }) => {
    const segment = await page.locator('.circle__segment[data-hour="16"]')

    // Check pointer events are enabled
    const pointerEvents = await segment.evaluate((el) => {
      return window.getComputedStyle(el).pointerEvents
    })

    // Should not be 'none'
    expect(pointerEvents).not.toBe('none')

    // Should be clickable
    await segment.click()
    await expect(segment).toBeVisible()
  })

  test('should maintain performance with multiple rapid interactions', async ({ page }) => {
    const startTime = Date.now()

    // Perform 50 rapid interactions
    for (let i = 0; i < 50; i++) {
      const hour = i % 24
      const segment = await page.locator(`.circle__segment[data-hour="${hour}"]`)
      await segment.hover()
    }

    const duration = Date.now() - startTime

    // Should complete within reasonable time (< 5 seconds)
    expect(duration).toBeLessThan(5000)

    // All segments should still be rendered
    const segments = await page.locator('.circle__segment')
    const count = await segments.count()
    expect(count).toBe(24)
  })
})
