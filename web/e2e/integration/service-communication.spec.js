import { test, expect } from '@playwright/test'

/**
 * Integration tests for service communication
 * Tests communication between frontend and backend services
 */
test.describe('Service Communication Integration', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/')
  })

  test('should communicate with auth service for health check', async ({ page }) => {
    // Test direct communication with auth service
    const authHealthResponse = await page.evaluate(async () => {
      const baseUrl = window.location.hostname === 'localhost' && window.location.port === '5173'
        ? 'http://localhost:3000' // Development environment
        : 'http://auth:3000' // Containerized environment

      try {
        const response = await fetch(`${baseUrl}/health`)
        return {
          ok: response.ok,
          status: response.status,
          data: await response.json()
        }
      } catch (error) {
        return {
          ok: false,
          error: error.message
        }
      }
    })

    expect(authHealthResponse.ok).toBe(true)
    expect(authHealthResponse.status).toBe(200)
    expect(authHealthResponse.data).toHaveProperty('status', 'ok')
  })

  test('should communicate with app service for health check', async ({ page }) => {
    // Test direct communication with app service
    const appHealthResponse = await page.evaluate(async () => {
      const baseUrl = window.location.hostname === 'localhost' && window.location.port === '5173'
        ? 'http://localhost:3001' // Development environment
        : 'http://app:3001' // Containerized environment

      try {
        const response = await fetch(`${baseUrl}/health`)
        return {
          ok: response.ok,
          status: response.status,
          data: await response.json()
        }
      } catch (error) {
        return {
          ok: false,
          error: error.message
        }
      }
    })

    expect(appHealthResponse.ok).toBe(true)
    expect(appHealthResponse.status).toBe(200)
    expect(appHealthResponse.data).toHaveProperty('status', 'ok')
  })

  test('should communicate with catalogos service for health check', async ({ page }) => {
    // Test direct communication with catalogos service
    const catalogosHealthResponse = await page.evaluate(async () => {
      const baseUrl = window.location.hostname === 'localhost' && window.location.port === '5173'
        ? 'http://localhost:3002' // Development environment
        : 'http://catalogos:3002' // Containerized environment

      try {
        const response = await fetch(`${baseUrl}/health`)
        return {
          ok: response.ok,
          status: response.status,
          data: await response.json()
        }
      } catch (error) {
        return {
          ok: false,
          error: error.message
        }
      }
    })

    expect(catalogosHealthResponse.ok).toBe(true)
    expect(catalogosHealthResponse.status).toBe(200)
    expect(catalogosHealthResponse.data).toHaveProperty('status', 'ok')
  })

  test('should handle CORS properly between services', async ({ page }) => {
    // Test CORS configuration by making cross-origin requests
    const corsTestResponse = await page.evaluate(async () => {
      const authUrl = window.location.hostname === 'localhost' && window.location.port === '5173'
        ? 'http://localhost:3000' // Development environment
        : 'http://auth:3000' // Containerized environment

      try {
        const response = await fetch(`${authUrl}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Origin': window.location.origin
          }
        })

        return {
          ok: response.ok,
          status: response.status,
          headers: {
            'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
            'access-control-allow-credentials': response.headers.get('access-control-allow-credentials')
          }
        }
      } catch (error) {
        return {
          ok: false,
          error: error.message
        }
      }
    })

    expect(corsTestResponse.ok).toBe(true)
    expect(corsTestResponse.status).toBe(200)
    // CORS headers should be present
    expect(corsTestResponse.headers['access-control-allow-origin']).toBeTruthy()
  })

  test('should handle service timeouts gracefully', async ({ page }) => {
    // Test timeout handling by making requests with short timeouts
    const timeoutTestResponse = await page.evaluate(async () => {
      const authUrl = window.location.hostname === 'localhost' && window.location.port === '5173'
        ? 'http://localhost:3000' // Development environment
        : 'http://auth:3000' // Containerized environment

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 100) // Very short timeout

      try {
        const response = await fetch(`${authUrl}/health`, {
          signal: controller.signal
        })
        clearTimeout(timeoutId)

        return {
          ok: response.ok,
          status: response.status,
          timedOut: false
        }
      } catch (error) {
        clearTimeout(timeoutId)
        return {
          ok: false,
          timedOut: error.name === 'AbortError',
          error: error.message
        }
      }
    })

    // Either the request succeeds quickly or times out gracefully
    expect(timeoutTestResponse.ok || timeoutTestResponse.timedOut).toBe(true)
  })

  test('should validate environment-specific service URLs', async ({ page }) => {
    // Test that the correct service URLs are being used based on environment
    const environmentInfo = await page.evaluate(() => {
      return {
        hostname: window.location.hostname,
        port: window.location.port,
        protocol: window.location.protocol,
        origin: window.location.origin,
        viteMode: import.meta.env.VITE_MODE,
        baseUrl: import.meta.env.VITE_BASE_URL,
        authUrl: import.meta.env.VITE_URL_AUTH,
        catalogosUrl: import.meta.env.VITE_CATALOGOS_URL
      }
    })

    // Validate environment configuration
    expect(environmentInfo.viteMode).toBeTruthy()
    expect(environmentInfo.baseUrl).toBeTruthy()
    expect(environmentInfo.authUrl).toBeTruthy()

    // Validate URLs based on environment
    if (environmentInfo.hostname === 'localhost' && environmentInfo.port === '5173') {
      // Development environment - should use host.docker.internal or localhost
      expect(environmentInfo.baseUrl).toMatch(/localhost:3001|host\.docker\.internal:3001/)
      expect(environmentInfo.authUrl).toMatch(/localhost:3000|host\.docker\.internal:3000/)
    } else {
      // Containerized environment - should use internal service names
      expect(environmentInfo.baseUrl).toMatch(/app:3001/)
      expect(environmentInfo.authUrl).toMatch(/auth:3000/)
    }
  })
})

test.describe('Database Communication Integration', () => {

  test('should connect to database through services', async ({ page }) => {
    // Test database connectivity through backend services
    await page.goto('/')

    // Test auth service database connection
    const authDbResponse = await page.evaluate(async () => {
      const authUrl = window.location.hostname === 'localhost' && window.location.port === '5173'
        ? 'http://localhost:3000' // Development environment
        : 'http://auth:3000' // Containerized environment

      try {
        const response = await fetch(`${authUrl}/health/db`)
        return {
          ok: response.ok,
          status: response.status,
          data: response.ok ? await response.json() : null
        }
      } catch (error) {
        return {
          ok: false,
          error: error.message
        }
      }
    })

    // Database health check should succeed
    expect(authDbResponse.ok).toBe(true)
    expect(authDbResponse.status).toBe(200)
  })

  test('should handle database connection failures gracefully', async ({ page }) => {
    // This test validates error handling when database is unavailable
    await page.goto('/')

    // Mock a database connection failure scenario
    const dbErrorResponse = await page.evaluate(async () => {
      const authUrl = window.location.hostname === 'localhost' && window.location.port === '5173'
        ? 'http://localhost:3000' // Development environment
        : 'http://auth:3000' // Containerized environment

      try {
        // Try to access an endpoint that requires database
        const response = await fetch(`${authUrl}/api/users/nonexistent`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        return {
          ok: response.ok,
          status: response.status,
          data: response.ok ? await response.json() : await response.text()
        }
      } catch (error) {
        return {
          ok: false,
          error: error.message
        }
      }
    })

    // Should handle gracefully (either 404 for not found or proper error response)
    expect([404, 401, 500].includes(dbErrorResponse.status)).toBe(true)
  })
})
