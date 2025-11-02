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

test.describe('Event Rendering in Circle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Clear storage
    await page.evaluate(() => {
      localStorage.clear()
      return indexedDB.deleteDatabase('24hours-db')
    })

    await page.reload()
    await page.waitForSelector('.circle__svg')
  })

  test('should render events group in SVG', async ({ page }) => {
    const eventsGroup = await page.locator('.circle__events')
    await expect(eventsGroup).toBeAttached()
  })

  test('should render event arc when event is created', async ({ page }) => {
    // Create an event
    await page.locator('.circle__segment[data-hour="10"]').click()
    await page.locator('#event-title').fill('Test Event')
    await page.locator('#event-start').fill('10:00')
    await page.locator('#event-end').fill('11:00')
    await page.locator('#save-button').click()

    // Event arc should be visible
    const eventArc = await page.locator('.circle__event')
    await expect(eventArc).toBeVisible()

    // Should have correct data attributes
    const eventTitle = await eventArc.getAttribute('data-event-title')
    expect(eventTitle).toBe('Test Event')
  })

  test('should render multiple events without overlap', async ({ page }) => {
    // Create first event
    await page.locator('.circle__segment[data-hour="9"]').click()
    await page.locator('#event-title').fill('Event 1')
    await page.locator('#event-start').fill('09:00')
    await page.locator('#event-end').fill('10:00')
    await page.locator('#save-button').click()

    // Create second event
    await page.locator('.circle__segment[data-hour="11"]').click()
    await page.locator('#event-title').fill('Event 2')
    await page.locator('#event-start').fill('11:00')
    await page.locator('#event-end').fill('12:00')
    await page.locator('#save-button').click()

    // Both events should be visible
    const events = await page.locator('.circle__event')
    const eventCount = await events.count()
    expect(eventCount).toBe(2)
  })

  test('should render events with different colors based on category', async ({ page }) => {
    // Create work event
    await page.locator('.circle__segment[data-hour="9"]').click()
    await page.locator('#event-title').fill('Work Event')
    await page.locator('#event-start').fill('09:00')
    await page.locator('#event-end').fill('10:00')
    await page.locator('#event-category').selectOption('work')
    await page.locator('#save-button').click()

    // Create meeting event
    await page.locator('.circle__segment[data-hour="11"]').click()
    await page.locator('#event-title').fill('Meeting Event')
    await page.locator('#event-start').fill('11:00')
    await page.locator('#event-end').fill('12:00')
    await page.locator('#event-category').selectOption('meeting')
    await page.locator('#save-button').click()

    // Get event colors
    const workEvent = await page.locator('.circle__event[data-event-title="Work Event"]')
    const meetingEvent = await page.locator('.circle__event[data-event-title="Meeting Event"]')

    const workColor = await workEvent.getAttribute('fill')
    const meetingColor = await meetingEvent.getAttribute('fill')

    // Colors should be different
    expect(workColor).not.toBe(meetingColor)
  })

  test('should render events with correct arc size based on duration', async ({ page }) => {
    // Create short event (30 minutes)
    await page.locator('.circle__segment[data-hour="9"]').click()
    await page.locator('#event-title').fill('Short Event')
    await page.locator('#event-start').fill('09:00')
    await page.locator('#event-end').fill('09:30')
    await page.locator('#save-button').click()

    // Create long event (3 hours)
    await page.locator('.circle__segment[data-hour="14"]').click()
    await page.locator('#event-title').fill('Long Event')
    await page.locator('#event-start').fill('14:00')
    await page.locator('#event-end').fill('17:00')
    await page.locator('#save-button').click()

    // Both events should be visible
    const shortEvent = await page.locator('.circle__event[data-event-title="Short Event"]')
    const longEvent = await page.locator('.circle__event[data-event-title="Long Event"]')

    await expect(shortEvent).toBeVisible()
    await expect(longEvent).toBeVisible()

    // Get path data to compare arc sizes (longer events should have larger path data)
    const shortPath = await shortEvent.getAttribute('d')
    const longPath = await longEvent.getAttribute('d')

    // Path data for longer event should be longer (more characters)
    expect(longPath?.length).toBeGreaterThan(shortPath?.length || 0)
  })

  test('should render vertical hour labels correctly rotated', async ({ page }) => {
    const labelGroups = await page.locator('.circle__label-group')

    // Check first major label (hour 0)
    const firstLabel = labelGroups.first()
    const transform = await firstLabel.getAttribute('transform')

    // Should have both translate and rotate
    expect(transform).toContain('translate')
    expect(transform).toContain('rotate')
  })

  test('should verify labels are positioned radially', async ({ page }) => {
    const labelGroups = await page.locator('.circle__label-group')
    const labelCount = await labelGroups.count()

    // Each label should have unique rotation based on hour
    const rotations = []

    for (let i = 0; i < labelCount; i++) {
      const label = labelGroups.nth(i)
      const transform = await label.getAttribute('transform')

      // Extract rotation value from transform
      const rotateMatch = transform?.match(/rotate\(([^)]+)\)/)
      if (rotateMatch) {
        rotations.push(rotateMatch[1])
      }
    }

    // All rotations should be unique
    const uniqueRotations = new Set(rotations)
    expect(uniqueRotations.size).toBe(labelCount)
  })

  test('should show event tooltip on hover', async ({ page }) => {
    // Create an event
    await page.locator('.circle__segment[data-hour="10"]').click()
    await page.locator('#event-title').fill('Hover Test Event')
    await page.locator('#event-start').fill('10:00')
    await page.locator('#event-end').fill('11:00')
    await page.locator('#event-description').fill('Test description')
    await page.locator('#save-button').click()

    // Hover over event
    const eventArc = await page.locator('.circle__event[data-event-title="Hover Test Event"]')
    await eventArc.hover()

    // Tooltip should appear
    const tooltip = await page.locator('.circle__event-tooltip')
    await expect(tooltip).toBeVisible()

    // Tooltip should contain event details
    await expect(tooltip).toContainText('Hover Test Event')
    await expect(tooltip).toContainText('10:00')
    await expect(tooltip).toContainText('11:00')
    await expect(tooltip).toContainText('Test description')
  })

  test('should hide tooltip when mouse leaves event', async ({ page }) => {
    // Create an event
    await page.locator('.circle__segment[data-hour="10"]').click()
    await page.locator('#event-title').fill('Tooltip Test')
    await page.locator('#event-start').fill('10:00')
    await page.locator('#event-end').fill('11:00')
    await page.locator('#save-button').click()

    const eventArc = await page.locator('.circle__event[data-event-title="Tooltip Test"]')

    // Hover to show tooltip
    await eventArc.hover()
    await expect(page.locator('.circle__event-tooltip')).toBeVisible()

    // Move away
    await page.locator('.circle__center').hover()

    // Tooltip should be hidden
    await expect(page.locator('.circle__event-tooltip')).not.toBeVisible()
  })

  test('should maintain event visibility when resizing window', async ({ page }) => {
    // Create an event
    await page.locator('.circle__segment[data-hour="10"]').click()
    await page.locator('#event-title').fill('Resize Test Event')
    await page.locator('#event-start').fill('10:00')
    await page.locator('#event-end').fill('11:00')
    await page.locator('#save-button').click()

    // Verify event is visible on desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('.circle__event[data-event-title="Resize Test Event"]')).toBeVisible()

    // Verify event is visible on tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('.circle__event[data-event-title="Resize Test Event"]')).toBeVisible()

    // Verify event is visible on mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('.circle__event[data-event-title="Resize Test Event"]')).toBeVisible()
  })

  test('should render events with minute precision arcs', async ({ page }) => {
    // Create event with specific minute times
    await page.locator('.circle__segment[data-hour="10"]').click()
    await page.locator('#event-title').fill('Minute Precision Event')
    await page.locator('#event-start').fill('10:15')
    await page.locator('#event-end').fill('10:45')
    await page.locator('#save-button').click()

    // Event should be rendered
    const eventArc = await page.locator('.circle__event[data-event-title="Minute Precision Event"]')
    await expect(eventArc).toBeVisible()

    // Get path data (should reflect minute precision in coordinates)
    const pathData = await eventArc.getAttribute('d')
    expect(pathData).toBeDefined()
    expect(pathData).toContain('A') // Should contain arc command
  })

  test('should layer events correctly (z-index)', async ({ page }) => {
    // Create first event
    await page.locator('.circle__segment[data-hour="10"]').click()
    await page.locator('#event-title').fill('First Event')
    await page.locator('#event-start').fill('10:00')
    await page.locator('#event-end').fill('11:00')
    await page.locator('#save-button').click()

    // Create second event (later)
    await page.locator('.circle__segment[data-hour="12"]').click()
    await page.locator('#event-title').fill('Second Event')
    await page.locator('#event-start').fill('12:00')
    await page.locator('#event-end').fill('13:00')
    await page.locator('#save-button').click()

    // Verify both events are visible and in events group
    const eventsGroup = await page.locator('.circle__events')
    const events = await eventsGroup.locator('.circle__event')
    const eventCount = await events.count()

    expect(eventCount).toBe(2)
  })

  test('should render events in correct SVG layer order', async ({ page }) => {
    // Create an event
    await page.locator('.circle__segment[data-hour="10"]').click()
    await page.locator('#event-title').fill('Layer Test Event')
    await page.locator('#event-start').fill('10:00')
    await page.locator('#event-end').fill('11:00')
    await page.locator('#save-button').click()

    const svg = await page.locator('.circle__svg')

    // Get all child groups in order
    const groups = await svg.locator('> g')
    const groupClasses = []

    for (let i = 0; i < await groups.count(); i++) {
      const group = groups.nth(i)
      const className = await group.getAttribute('class')
      if (className) {
        groupClasses.push(className)
      }
    }

    // Expected order: ticks → segments → events → labels → center
    expect(groupClasses).toContain('circle__ticks')
    expect(groupClasses).toContain('circle__segments')
    expect(groupClasses).toContain('circle__events')
    expect(groupClasses).toContain('circle__labels')
    expect(groupClasses).toContain('circle__center-group')

    // Events should be between segments and labels
    const segmentsIndex = groupClasses.indexOf('circle__segments')
    const eventsIndex = groupClasses.indexOf('circle__events')
    const labelsIndex = groupClasses.indexOf('circle__labels')

    expect(eventsIndex).toBeGreaterThan(segmentsIndex)
    expect(labelsIndex).toBeGreaterThan(eventsIndex)
  })
})
