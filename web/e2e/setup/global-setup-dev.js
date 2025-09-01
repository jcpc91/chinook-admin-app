import { chromium } from '@playwright/test'
import { execSync } from 'child_process'

/**
 * Global setup for development environment tests
 * Ensures local backend services are running and containerized web is ready
 */
async function globalSetup() {
  console.log('🔧 Setting up development environment for e2e tests...')

  try {
    // Check if local backend services are running
    console.log('📡 Checking local backend services...')

    // Check auth service (port 3000)
    try {
      const authResponse = await fetch('http://localhost:3000/health', {
        method: 'GET',
        timeout: 5000
      })
      if (!authResponse.ok) {
        throw new Error(`Auth service health check failed: ${authResponse.status}`)
      }
      console.log('✅ Auth service is running on port 3000')
    } catch (error) {
      console.warn('⚠️  Auth service not running on port 3000. Starting it...')
      // Start auth service in background
      execSync('cd ../auth && npm run dev &', { stdio: 'inherit' })
      // Wait for service to start
      await new Promise(resolve => setTimeout(resolve, 10000))
    }

    // Check app service (port 3001)
    try {
      const appResponse = await fetch('http://localhost:3001/health', {
        method: 'GET',
        timeout: 5000
      })
      if (!appResponse.ok) {
        throw new Error(`App service health check failed: ${appResponse.status}`)
      }
      console.log('✅ App service is running on port 3001')
    } catch (error) {
      console.warn('⚠️  App service not running on port 3001. Starting it...')
      // Start app service in background
      execSync('cd ../app && npm run dev &', { stdio: 'inherit' })
      // Wait for service to start
      await new Promise(resolve => setTimeout(resolve, 10000))
    }

    // Check catalogos service (port 3002)
    try {
      const catalogosResponse = await fetch('http://localhost:3002/health', {
        method: 'GET',
        timeout: 5000
      })
      if (!catalogosResponse.ok) {
        throw new Error(`Catalogos service health check failed: ${catalogosResponse.status}`)
      }
      console.log('✅ Catalogos service is running on port 3002')
    } catch (error) {
      console.warn('⚠️  Catalogos service not running on port 3002. Starting it...')
      // Start catalogos service in background
      execSync('cd ../catalogos && npm run dev &', { stdio: 'inherit' })
      // Wait for service to start
      await new Promise(resolve => setTimeout(resolve, 10000))
    }

    // Ensure SQLite databases are initialized
    console.log('🗄️  Checking SQLite databases...')
    try {
      execSync('cd ../database && npm run migrate-auth && npm run migrate-app && npm run migrate-cat', {
        stdio: 'inherit'
      })
      console.log('✅ SQLite databases initialized')
    } catch (error) {
      console.error('❌ Failed to initialize SQLite databases:', error.message)
      throw error
    }

    // Wait for containerized web service to be ready
    console.log('🌐 Waiting for containerized web service...')
    let webReady = false
    let attempts = 0
    const maxAttempts = 30

    while (!webReady && attempts < maxAttempts) {
      try {
        const webResponse = await fetch('http://localhost:5173/', {
          method: 'GET',
          timeout: 5000
        })
        if (webResponse.ok) {
          webReady = true
          console.log('✅ Containerized web service is ready')
        }
      } catch (error) {
        attempts++
        console.log(`⏳ Waiting for web service... (attempt ${attempts}/${maxAttempts})`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    if (!webReady) {
      throw new Error('Web service failed to start within timeout period')
    }

    // Create test user and data
    console.log('👤 Setting up test data...')
    await setupTestData()

    console.log('✅ Development environment setup complete!')

  } catch (error) {
    console.error('❌ Development environment setup failed:', error.message)
    throw error
  }
}

/**
 * Setup test data for development environment
 */
async function setupTestData() {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Navigate to the application
    await page.goto('http://localhost:5173/')

    // Add any test data setup logic here
    // For example, creating test users, sample data, etc.

    console.log('✅ Test data setup complete')
  } catch (error) {
    console.error('❌ Test data setup failed:', error.message)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup
