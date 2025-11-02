/**
 * E2E Tests for Circle View Component
 * Tests rendering and visual aspects of the 24-hour circle
 */

import { test, expect } from '@playwright/test'

test.describe('24-Hour Circle Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should render the circle container', async ({ page }) => {
    const circleContainer = await page.locator('#circle-container')
    await expect(circleContainer).toBeVisible()
  })

  test('should render SVG circle element', async ({ page }) => {
    const svg = await page.locator('.circle__svg')
    await expect(svg).toBeAttached()
    await expect(svg).toBeVisible()

    // Verify SVG has correct viewBox
    const viewBox = await svg.getAttribute('viewBox')
    expect(viewBox).toBe('0 0 400 400')
  })

  test('should render all 24 hour segments', async ({ page }) => {
    const segments = await page.locator('.circle__segment')
    const segmentCount = await segments.count()

    expect(segmentCount).toBe(24)
  })

  test('should have unique data-hour attributes for all segments', async ({ page }) => {
    const segments = await page.locator('.circle__segment')
    const hours = new Set()

    for (let i = 0; i < 24; i++) {
      const segment = segments.nth(i)
      const hour = await segment.getAttribute('data-hour')
      hours.add(hour)
    }

    expect(hours.size).toBe(24)
  })

  test('should highlight current hour segment', async ({ page }) => {
    const currentSegment = await page.locator('.circle__segment--current')
    await expect(currentSegment).toBeAttached()

    // Get current hour
    const currentHour = new Date().getHours()

    // Verify the highlighted segment matches current hour
    const highlightedHour = await currentSegment.getAttribute('data-hour')
    expect(parseInt(highlightedHour)).toBe(currentHour)
  })

  test('should render major hour labels (0, 3, 6, 9, 12, 15, 18, 21)', async ({ page }) => {
    const majorLabels = await page.locator('.circle__label--major')
    const labelCount = await majorLabels.count()

    expect(labelCount).toBe(8)

    // Check if labels contain correct hours
    const expectedHours = ['0', '3', '6', '9', '12', '15', '18', '21']
    const actualLabels = []

    for (let i = 0; i < 8; i++) {
      const label = majorLabels.nth(i)
      const text = await label.textContent()
      actualLabels.push(text)
    }

    expectedHours.forEach(hour => {
      expect(actualLabels).toContain(hour)
    })
  })

  test('should render center circle', async ({ page }) => {
    const centerCircle = await page.locator('.circle__center')
    await expect(centerCircle).toBeAttached()

    // Verify center position (should be at 200, 200 based on config)
    const cx = await centerCircle.getAttribute('cx')
    const cy = await centerCircle.getAttribute('cy')

    expect(cx).toBe('200')
    expect(cy).toBe('200')
  })

  test('should display current time in center', async ({ page }) => {
    const centerTime = await page.locator('#center-time')
    await expect(centerTime).toBeVisible()

    const timeText = await centerTime.textContent()

    // Verify format HH:MM
    expect(timeText).toMatch(/^\d{2}:\d{2}$/)
  })

  test('should display current date in center', async ({ page }) => {
    const centerDate = await page.locator('#center-date')
    await expect(centerDate).toBeVisible()

    const dateText = await centerDate.textContent()

    // Verify format DD.MM
    expect(dateText).toMatch(/^\d{2}\.\d{2}$/)
  })

  test('should render tick marks around circle', async ({ page }) => {
    const ticksGroup = await page.locator('.circle__ticks')
    await expect(ticksGroup).toBeAttached()

    const ticks = await page.locator('.circle__tick')
    const tickCount = await ticks.count()

    // Should have 24 ticks (one for each hour)
    expect(tickCount).toBe(24)
  })

  test('should have major tick marks for key hours', async ({ page }) => {
    const majorTicks = await page.locator('.circle__tick--major')
    const majorTickCount = await majorTicks.count()

    // Should have 8 major ticks for hours 0, 3, 6, 9, 12, 15, 18, 21
    expect(majorTickCount).toBe(8)
  })

  test('should render with correct responsive sizing', async ({ page }) => {
    const circleWrapper = await page.locator('.circle')
    await expect(circleWrapper).toBeVisible()

    // Get computed dimensions
    const boundingBox = await circleWrapper.boundingBox()

    expect(boundingBox).not.toBeNull()
    expect(boundingBox?.width).toBeGreaterThan(0)
    expect(boundingBox?.height).toBeGreaterThan(0)
  })

  test('should render correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    const circleContainer = await page.locator('#circle-container')
    await expect(circleContainer).toBeVisible()

    const svg = await page.locator('.circle__svg')
    await expect(svg).toBeVisible()

    // Verify all segments are still rendered
    const segments = await page.locator('.circle__segment')
    const segmentCount = await segments.count()
    expect(segmentCount).toBe(24)
  })

  test('should maintain aspect ratio on different screen sizes', async ({ page }) => {
    const svg = await page.locator('.circle__svg')

    // Test on desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    const desktopBox = await svg.boundingBox()

    // Test on tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    const tabletBox = await svg.boundingBox()

    // Test on mobile
    await page.setViewportSize({ width: 375, height: 667 })
    const mobileBox = await svg.boundingBox()

    // All should have roughly square aspect ratio
    if (desktopBox && tabletBox && mobileBox) {
      const desktopRatio = desktopBox.width / desktopBox.height
      const tabletRatio = tabletBox.width / tabletBox.height
      const mobileRatio = mobileBox.width / mobileBox.height

      // Allow 10% variance for aspect ratio
      expect(Math.abs(desktopRatio - 1)).toBeLessThan(0.1)
      expect(Math.abs(tabletRatio - 1)).toBeLessThan(0.1)
      expect(Math.abs(mobileRatio - 1)).toBeLessThan(0.1)
    }
  })

  test('should have proper SVG structure hierarchy', async ({ page }) => {
    const svg = await page.locator('.circle__svg')

    // Check for groups in expected order
    const ticksGroup = await svg.locator('.circle__ticks')
    const segmentsGroup = await svg.locator('.circle__segments')
    const labelsGroup = await svg.locator('.circle__labels')
    const centerGroup = await svg.locator('.circle__center-group')

    await expect(ticksGroup).toBeAttached()
    await expect(segmentsGroup).toBeAttached()
    await expect(labelsGroup).toBeAttached()
    await expect(centerGroup).toBeAttached()
  })

  test('should render with correct CSS classes', async ({ page }) => {
    const circleWrapper = await page.locator('.circle')
    await expect(circleWrapper).toHaveClass('circle')

    const svg = await page.locator('.circle__svg')
    await expect(svg).toHaveClass('circle__svg')

    const segments = await page.locator('.circle__segments')
    await expect(segments).toHaveClass('circle__segments')
  })

  test('should apply theme colors correctly', async ({ page }) => {
    const centerCircle = await page.locator('.circle__center')

    // Get computed style
    const fill = await centerCircle.evaluate((el) => {
      return window.getComputedStyle(el).fill
    })

    // Should have some fill color (not transparent)
    expect(fill).not.toBe('none')
    expect(fill).not.toBe('transparent')
  })

  test('should be accessible with proper ARIA structure', async ({ page }) => {
    // Check main elements are accessible
    const circleContainer = await page.locator('#circle-container')
    await expect(circleContainer).toBeVisible()

    // Verify SVG is not hidden from screen readers
    const svg = await page.locator('.circle__svg')
    const ariaHidden = await svg.getAttribute('aria-hidden')
    expect(ariaHidden).not.toBe('true')
  })
})
