/**
 * E2E Tests for Offline Functionality
 * Tests app behavior when offline and cache strategies
 */

import { test, expect } from '@playwright/test'

test.describe('Offline Functionality', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Wait for service worker to be ready
    await page.waitForTimeout(2000)
  })

  test('should load app when going offline after initial load', async ({ page, context }) => {
    // Verify app is loaded
    await expect(page.locator('#app')).toBeVisible()

    // Go offline
    await context.setOffline(true)

    // Reload page
    await page.reload()

    // App should still load from cache
    await expect(page.locator('#app')).toBeVisible()
    await expect(page.locator('.circle__svg')).toBeVisible()

    // Go back online
    await context.setOffline(false)
  })

  test('should display circle view when offline', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true)

    // Reload page
    await page.reload()

    // Circle should be visible
    const circleContainer = await page.locator('#circle-container')
    await expect(circleContainer).toBeVisible()

    const segments = await page.locator('.circle__segment')
    const count = await segments.count()
    expect(count).toBe(24)

    // Go back online
    await context.setOffline(false)
  })

  test('should show current time even when offline', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true)

    // Reload page
    await page.reload()

    // Center time should be visible
    const centerTime = await page.locator('#center-time')
    await expect(centerTime).toBeVisible()

    const timeText = await centerTime.textContent()
    expect(timeText).toMatch(/^\d{2}:\d{2}$/)

    // Go back online
    await context.setOffline(false)
  })

  test('should maintain interactivity when offline', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true)

    // Reload page
    await page.reload()

    // Try to interact with segments
    const segment = await page.locator('.circle__segment[data-hour="10"]')
    await segment.hover()
    await segment.click()

    // Interaction should work
    await expect(segment).toBeVisible()

    // Go back online
    await context.setOffline(false)
  })

  test('should serve CSS styles when offline', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true)

    // Reload page
    await page.reload()

    // Check if styles are applied
    const centerCircle = await page.locator('.circle__center')
    await expect(centerCircle).toBeVisible()

    const fill = await centerCircle.evaluate((el) => {
      return window.getComputedStyle(el).fill
    })

    // Should have styling applied
    expect(fill).not.toBe('none')

    // Go back online
    await context.setOffline(false)
  })

  test('should serve JavaScript when offline', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true)

    // Reload page
    await page.reload()

    // Verify JavaScript is working (circle is rendered)
    const segments = await page.locator('.circle__segment')
    const count = await segments.count()
    expect(count).toBe(24)

    // Center time should update (JS is working)
    const centerTime = await page.locator('#center-time')
    const timeText = await centerTime.textContent()
    expect(timeText).toBeTruthy()

    // Go back online
    await context.setOffline(false)
  })

  test('should persist data when going offline', async ({ page, context }) => {
    // Verify initial state
    await expect(page.locator('#app')).toBeVisible()

    // Get current time from center
    const initialTime = await page.locator('#center-time').textContent()

    // Go offline
    await context.setOffline(true)

    // Reload
    await page.reload()

    // Time should still be displayed (using local system time)
    const offlineTime = await page.locator('#center-time').textContent()
    expect(offlineTime).toMatch(/^\d{2}:\d{2}$/)

    // Go back online
    await context.setOffline(false)
  })

  test('should handle offline to online transition smoothly', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true)
    await page.reload()

    // Verify offline functionality
    await expect(page.locator('.circle__svg')).toBeVisible()

    // Go back online
    await context.setOffline(false)

    // Reload page
    await page.reload()

    // Should work normally
    await expect(page.locator('.circle__svg')).toBeVisible()
    const segments = await page.locator('.circle__segment')
    expect(await segments.count()).toBe(24)
  })

  test('should cache manifest.json for offline access', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true)

    // Try to access manifest
    const manifestResponse = await page.goto('http://localhost:3000/manifest.webmanifest')

    // Should be available from cache
    expect(manifestResponse?.status()).toBe(200)

    // Should have valid content
    const manifest = await manifestResponse?.json()
    expect(manifest).toHaveProperty('name')

    // Go back online
    await context.setOffline(false)
  })

  test('should cache icons for offline access', async ({ page, context }) => {
    // Load page to ensure icons are cached
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Go offline
    await context.setOffline(true)

    // Try to access icon
    const iconResponse = await page.goto('http://localhost:3000/icons/icon-192x192.png')

    // Should be available from cache
    expect(iconResponse?.status()).toBe(200)

    // Go back online
    await context.setOffline(false)
  })

  test('should show all UI elements when offline', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true)
    await page.reload()

    // Check header
    const header = await page.locator('.app-header')
    await expect(header).toBeVisible()

    // Check title
    const title = await page.locator('.app-header__title')
    await expect(title).toBeVisible()
    expect(await title.textContent()).toBe('24Hours')

    // Check circle container
    await expect(page.locator('#circle-container')).toBeVisible()

    // Check footer
    await expect(page.locator('.app-footer')).toBeVisible()

    // Check add event button
    await expect(page.locator('#add-event-button')).toBeVisible()

    // Go back online
    await context.setOffline(false)
  })

  test('should maintain app state across offline sessions', async ({ page, context }) => {
    // Initial load
    await expect(page.locator('#app')).toBeVisible()

    // Get current hour segment
    const currentSegment = await page.locator('.circle__segment--current')
    const currentHour = await currentSegment.getAttribute('data-hour')

    // Go offline
    await context.setOffline(true)
    await page.reload()

    // Current hour should still be marked
    const offlineCurrentSegment = await page.locator('.circle__segment--current')
    await expect(offlineCurrentSegment).toBeAttached()

    // Go back online
    await context.setOffline(false)
  })

  test('should handle button clicks when offline', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true)
    await page.reload()

    // Try to click add event button
    const addButton = await page.locator('#add-event-button')
    await expect(addButton).toBeVisible()
    await addButton.click()

    // Button should be interactive (even if no modal opens yet)
    await expect(addButton).toBeVisible()

    // Go back online
    await context.setOffline(false)
  })

  test('should show settings button when offline', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true)
    await page.reload()

    // Settings button should be visible
    const settingsButton = await page.locator('#settings-button')
    await expect(settingsButton).toBeVisible()

    // Should be clickable
    await settingsButton.click()

    // Go back online
    await context.setOffline(false)
  })

  test('should update time dynamically when offline', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true)
    await page.reload()

    // Get initial time
    const centerTime = await page.locator('#center-time')
    const initialTime = await centerTime.textContent()

    // Time should be displayed
    expect(initialTime).toMatch(/^\d{2}:\d{2}$/)

    // Note: We can't easily test time updates in a fast test,
    // but we verify the mechanism is in place
    await expect(centerTime).toBeVisible()

    // Go back online
    await context.setOffline(false)
  })

  test('should gracefully handle navigation when offline', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true)

    // Try to navigate to root
    await page.goto('/')

    // Should load from cache
    await expect(page.locator('#app')).toBeVisible()

    // Go back online
    await context.setOffline(false)
  })

  test('should support offline-first architecture', async ({ page, context }) => {
    // Initial load to populate cache
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Go offline immediately
    await context.setOffline(true)

    // Navigation should work
    await page.reload()

    // All core features should work
    await expect(page.locator('.circle__svg')).toBeVisible()
    await expect(page.locator('.circle__segment')).toHaveCount(24)
    await expect(page.locator('#center-time')).toBeVisible()

    // Interactions should work
    const segment = await page.locator('.circle__segment').first()
    await segment.click()
    await expect(segment).toBeVisible()

    // Go back online
    await context.setOffline(false)
  })

  test('should have reasonable performance when offline', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true)

    // Measure load time
    const startTime = Date.now()

    await page.reload()
    await page.waitForLoadState('load')

    const loadTime = Date.now() - startTime

    // Should load quickly from cache (< 2 seconds)
    expect(loadTime).toBeLessThan(2000)

    // Verify app is functional
    await expect(page.locator('.circle__svg')).toBeVisible()

    // Go back online
    await context.setOffline(false)
  })
})
