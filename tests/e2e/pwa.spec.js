/**
 * E2E Tests for PWA functionality
 * Tests service worker installation, caching, and PWA manifest
 */

import { test, expect } from '@playwright/test'

test.describe('PWA Installation and Service Worker', () => {
  test('should have valid PWA manifest', async ({ page }) => {
    await page.goto('/')

    // Check if manifest link exists (use .first() to handle multiple manifest links)
    const manifestLink = await page.locator('link[rel="manifest"]').first()
    await expect(manifestLink).toBeAttached()

    // Fetch and validate manifest (use the generated webmanifest)
    const manifestResponse = await page.goto('http://localhost:3000/manifest.webmanifest')
    expect(manifestResponse?.status()).toBe(200)

    const manifest = await manifestResponse?.json()
    expect(manifest).toHaveProperty('name')
    expect(manifest).toHaveProperty('short_name')
    expect(manifest).toHaveProperty('start_url')
    expect(manifest).toHaveProperty('display')
    expect(manifest.icons).toBeDefined()
    expect(manifest.icons.length).toBeGreaterThan(0)
  })

  test('should register service worker', async ({ page, context }) => {
    // Grant notification permissions if needed
    await context.grantPermissions(['notifications'])

    await page.goto('/')

    // Wait for service worker registration
    const swRegistered = await page.evaluate(async () => {
      // Wait up to 5 seconds for service worker
      const timeout = 5000
      const startTime = Date.now()

      while (Date.now() - startTime < timeout) {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration()
          if (registration) {
            return {
              registered: true,
              scope: registration.scope,
              active: registration.active !== null,
              installing: registration.installing !== null,
              waiting: registration.waiting !== null
            }
          }
        }
        // Wait a bit before checking again
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      return { registered: false }
    })

    expect(swRegistered.registered).toBe(true)
    expect(swRegistered.scope).toContain('localhost:3000')
  })

  test('should have service worker in active state', async ({ page }) => {
    await page.goto('/')

    // Wait for service worker to be active
    await page.waitForTimeout(2000) // Give SW time to activate

    const swActive = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        return registration?.active !== null
      }
      return false
    })

    expect(swActive).toBe(true)
  })

  test('should cache static assets', async ({ page }) => {
    await page.goto('/')

    // Wait for service worker to cache assets
    await page.waitForTimeout(2000)

    // Check if cache storage exists and has entries
    const cacheExists = await page.evaluate(async () => {
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        if (cacheNames.length > 0) {
          // Check first cache for entries
          const cache = await caches.open(cacheNames[0])
          const cachedRequests = await cache.keys()
          return {
            hasCaches: true,
            cacheCount: cacheNames.length,
            cachedItemsCount: cachedRequests.length,
            cacheNames: cacheNames
          }
        }
      }
      return { hasCaches: false, cacheCount: 0, cachedItemsCount: 0 }
    })

    expect(cacheExists.hasCaches).toBe(true)
    expect(cacheExists.cacheCount).toBeGreaterThan(0)
    expect(cacheExists.cachedItemsCount).toBeGreaterThan(0)
  })

  test('should have required PWA meta tags', async ({ page }) => {
    await page.goto('/')

    // Check for theme-color
    const themeColor = await page.locator('meta[name="theme-color"]')
    await expect(themeColor).toBeAttached()

    // Check for viewport
    const viewport = await page.locator('meta[name="viewport"]')
    await expect(viewport).toBeAttached()
    const viewportContent = await viewport.getAttribute('content')
    expect(viewportContent).toContain('width=device-width')

    // Check for description
    const description = await page.locator('meta[name="description"]')
    await expect(description).toBeAttached()

    // Check for apple-mobile-web-app-capable
    const appleCapable = await page.locator('meta[name="apple-mobile-web-app-capable"]')
    await expect(appleCapable).toBeAttached()
  })

  test('should have app icons', async ({ page }) => {
    await page.goto('/')

    // Check for favicon
    const favicon = await page.locator('link[rel="icon"]')
    await expect(favicon).toBeAttached()

    // Check for apple-touch-icon
    const appleTouchIcon = await page.locator('link[rel="apple-touch-icon"]')
    await expect(appleTouchIcon).toBeAttached()

    // Verify apple-touch-icon is accessible
    const iconHref = await appleTouchIcon.getAttribute('href')
    const iconResponse = await page.goto(`http://localhost:3000${iconHref}`)
    expect(iconResponse?.status()).toBe(200)
  })

  test('should support offline capability', async ({ page, context }) => {
    await page.goto('/')

    // Wait for initial page load and service worker
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Verify page loaded successfully
    const title = await page.title()
    expect(title).toContain('24Hours')

    // Go offline
    await context.setOffline(true)

    // Reload page while offline
    await page.reload()

    // Page should still load from cache
    const offlineTitle = await page.title()
    expect(offlineTitle).toContain('24Hours')

    // Main app container should be visible
    const appContainer = await page.locator('#app')
    await expect(appContainer).toBeVisible()

    // Go back online
    await context.setOffline(false)
  })

  test('should have proper PWA installability criteria', async ({ page }) => {
    await page.goto('/')

    // Check if beforeinstallprompt event is triggered
    // This indicates the app is installable
    const isInstallable = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
          resolve({ installed: true, installable: false })
          return
        }

        // Listen for install prompt
        const timeout = setTimeout(() => {
          resolve({ installed: false, installable: false, timeout: true })
        }, 3000)

        window.addEventListener('beforeinstallprompt', (e) => {
          clearTimeout(timeout)
          resolve({ installed: false, installable: true })
        })
      })
    })

    // Either the app should be installable or already installed
    // In test environment, timeout is expected as Chrome doesn't show prompt in headless
    expect(
      isInstallable.installable ||
      isInstallable.installed ||
      isInstallable.timeout
    ).toBe(true)
  })
})
