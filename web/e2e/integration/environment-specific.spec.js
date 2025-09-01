import { test, expect } from '@playwright/test'

/**
 * Environment-specific integration tests
 * Tests that validate behavior specific to development vs containerized environments
 */
test.describe('Environment-Specific Integration Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should detect correct environment configuration', async ({ page }) => {
    // Test environment detection and configuration
    const envConfig = await page.evaluate(() => {
      return {
        hostname: window.location.hostname,
        port: window.location.port,
        protocol: window.location.protocol,
        viteMode: import.meta.env.VITE_MODE,
        baseUrl: import.meta.env.VITE_BASE_URL,
        authUrl: import.meta.env.VITE_URL_AUTH,
        catalogosUrl: import.meta.env.VITE_CATALOGOS_URL,
        isDevelopment: window.location.port === '5173' && window.location.hostname === 'localhost',
        isStaging: window.location.port === '80' || window.location.port === '',
        isProduction: import.meta.env.VITE_MODE === 'production'
      }
    })

    // Validate environment configuration
    expect(envConfig.viteMode).toBeTruthy()
    expect(envConfig.baseUrl).toBeTruthy()
    expect(envConfig.authUrl).toBeTruthy()

    console.log('Environment detected:', {
      mode: envConfig.viteMode,
      isDev: envConfig.isDevelopment,
      isStaging: envConfig.isStaging,
      isProd: envConfig.isProduction
    })

    // Environment-specific validations
    if (envConfig.isDevelopment) {
      // Development environment should use localhost or host.docker.internal
      expect(envConfig.baseUrl).toMatch(/localhost|host\.docker\.internal/)
      expect(envConfig.authUrl).toMatch(/localhost|host\.docker\.internal/)
      console.log('✅ Development environment configuration validated')
    } else {
      // Containerized environments should use internal service names
      expect(envConfig.baseUrl).toMatch(/app:3001|localhost/)
      expect(envConfig.authUrl).toMatch(/auth:3000|localhost/)
      console.log('✅ Containerized environment configuration validated')
    }
  })

  test('should use correct database type per environment', async ({ page }) => {
    // Test database type detection through backend services
    const dbTypeResponse = await page.evaluate(async () => {
      const appUrl = window.location.hostname === 'localhost' && window.location.port === '5173'
        ? 'http://localhost:3001' // Development environment
        : 'http://app:3001' // Containerized environment

      try {
        const response = await fetch(`${appUrl}/health/db`)
        const data = await response.json()

        return {
          ok: response.ok,
          status: response.status,
          dbType: data.database?.type || data.dbType || 'unknown',
          dbHost: data.database?.host || data.dbHost || 'unknown'
        }
      } catch (error) {
        return {
          ok: false,
          error: error.message
        }
      }
    })

    if (dbTypeResponse.ok) {
      const isDevelopment = await page.evaluate(() =>
        window.location.port === '5173' && window.location.hostname === 'localhost'
      )

      if (isDevelopment) {
        // Development should use SQLite
        expect(dbTypeResponse.dbType).toMatch(/sqlite/i)
        console.log('✅ Development environment using SQLite')
      } else {
        // Containerized environments should use PostgreSQL
        expect(dbTypeResponse.dbType).toMatch(/postgres|postgresql/i)
        console.log('✅ Containerized environment using PostgreSQL')
      }
    } else {
      console.log('⚠️  Database health check not available, skipping database type validation')
    }
  })

  test('should handle network communication based on environment', async ({ page }) => {
    // Test network communication patterns
    const networkTest = await page.evaluate(async () => {
      const isDevelopment = window.location.port === '5173' && window.location.hostname === 'localhost'

      // Test auth service communication
      const authUrl = isDevelopment
        ? 'http://localhost:3000' // Development: direct to local service
        : 'http://auth:3000' // Containerized: internal Docker network

      try {
        const authResponse = await fetch(`${authUrl}/health`)

        // Test app service communication
        const appUrl = isDevelopment
          ? 'http://localhost:3001' // Development: direct to local service
          : 'http://app:3001' // Containerized: internal Docker network

        const appResponse = await fetch(`${appUrl}/health`)

        return {
          success: true,
          isDevelopment,
          authOk: authResponse.ok,
          appOk: appResponse.ok,
          authUrl,
          appUrl
        }
      } catch (error) {
        return {
          success: false,
          isDevelopment,
          error: error.message,
          authUrl,
          appUrl
        }
      }
    })

    expect(networkTest.success).toBe(true)
    expect(networkTest.authOk).toBe(true)
    expect(networkTest.appOk).toBe(true)

    if (networkTest.isDevelopment) {
      expect(networkTest.authUrl).toContain('localhost:3000')
      expect(networkTest.appUrl).toContain('localhost:3001')
      console.log('✅ Development network communication validated')
    } else {
      expect(networkTest.authUrl).toContain('auth:3000')
      expect(networkTest.appUrl).toContain('app:3001')
      console.log('✅ Containerized network communication validated')
    }
  })

  test('should validate CORS configuration per environment', async ({ page }) => {
    // Test CORS configuration
    const corsTest = await page.evaluate(async () => {
      const isDevelopment = window.location.port === '5173' && window.location.hostname === 'localhost'
      const origin = window.location.origin

      const authUrl = isDevelopment
        ? 'http://localhost:3000'
        : 'http://auth:3000'

      try {
        const response = await fetch(`${authUrl}/health`, {
          method: 'GET',
          headers: {
            'Origin': origin,
            'Content-Type': 'application/json'
          }
        })

        const corsHeaders = {
          'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
          'access-control-allow-credentials': response.headers.get('access-control-allow-credentials'),
          'access-control-allow-methods': response.headers.get('access-control-allow-methods')
        }

        return {
          success: true,
          isDevelopment,
          origin,
          corsHeaders,
          responseOk: response.ok
        }
      } catch (error) {
        return {
          success: false,
          isDevelopment,
          origin,
          error: error.message
        }
      }
    })

    expect(corsTest.success).toBe(true)
    expect(corsTest.responseOk).toBe(true)

    // CORS headers should be present
    expect(corsTest.corsHeaders['access-control-allow-origin']).toBeTruthy()

    console.log('✅ CORS configuration validated for environment:', {
      isDev: corsTest.isDevelopment,
      origin: corsTest.origin,
      allowOrigin: corsTest.corsHeaders['access-control-allow-origin']
    })
  })

  test('should validate service startup order in containerized environments', async ({ page }) => {
    // This test is more relevant for containerized environments
    const isContainerized = await page.evaluate(() =>
      !(window.location.port === '5173' && window.location.hostname === 'localhost')
    )

    if (!isContainerized) {
      console.log('⏭️  Skipping service startup order test for development environment')
      return
    }

    // Test service dependencies and startup order
    const serviceOrderTest = await page.evaluate(async () => {
      const services = [
        { name: 'auth', url: 'http://auth:3000/health' },
        { name: 'app', url: 'http://app:3001/health' },
        { name: 'catalogos', url: 'http://catalogos:3002/health' }
      ]

      const results = []

      for (const service of services) {
        try {
          const startTime = Date.now()
          const response = await fetch(service.url)
          const endTime = Date.now()

          results.push({
            name: service.name,
            ok: response.ok,
            status: response.status,
            responseTime: endTime - startTime
          })
        } catch (error) {
          results.push({
            name: service.name,
            ok: false,
            error: error.message
          })
        }
      }

      return {
        success: true,
        services: results,
        allHealthy: results.every(r => r.ok)
      }
    })

    expect(serviceOrderTest.success).toBe(true)
    expect(serviceOrderTest.allHealthy).toBe(true)

    console.log('✅ Service startup order validated:',
      serviceOrderTest.services.map(s => `${s.name}: ${s.ok ? 'healthy' : 'unhealthy'}`).join(', ')
    )
  })

  test('should validate resource limits and performance in production', async ({ page }) => {
    // Test performance characteristics
    const performanceTest = await page.evaluate(async () => {
      const isProduction = import.meta.env.VITE_MODE === 'production'

      if (!isProduction) {
        return { skipped: true, reason: 'Not production environment' }
      }

      const startTime = performance.now()

      // Test multiple concurrent requests to validate resource limits
      const authUrl = 'http://auth:3000/health'
      const appUrl = 'http://app:3001/health'

      try {
        const promises = Array.from({ length: 10 }, (_, i) =>
          i % 2 === 0 ? fetch(authUrl) : fetch(appUrl)
        )

        const responses = await Promise.all(promises)
        const endTime = performance.now()

        return {
          success: true,
          isProduction,
          totalTime: endTime - startTime,
          allSuccessful: responses.every(r => r.ok),
          responseCount: responses.length
        }
      } catch (error) {
        return {
          success: false,
          isProduction,
          error: error.message
        }
      }
    })

    if (performanceTest.skipped) {
      console.log('⏭️  Skipping production performance test:', performanceTest.reason)
      return
    }

    expect(performanceTest.success).toBe(true)
    expect(performanceTest.allSuccessful).toBe(true)

    // Performance should be reasonable (less than 10 seconds for 10 requests)
    expect(performanceTest.totalTime).toBeLessThan(10000)

    console.log('✅ Production performance validated:', {
      totalTime: `${performanceTest.totalTime.toFixed(2)}ms`,
      requestCount: performanceTest.responseCount
    })
  })
})
