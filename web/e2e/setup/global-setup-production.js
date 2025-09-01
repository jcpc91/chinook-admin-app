import { chromium } from '@playwright/test'
import { execSync } from 'child_process'

/**
 * Global setup for production environment tests
 * Ensures all production-optimized containerized services are running
 */
async function globalSetup() {
  console.log('🔧 Setting up production environment for e2e tests...')

  try {
    // Ensure production environment file exists
    console.log('📋 Checking production environment configuration...')
    await checkProductionConfig()

    // Start production environment with Docker Compose
    console.log('🐳 Starting production containers...')
    execSync('docker-compose -f ../docker-compose.prod.yml --env-file ../.env.production up -d', {
      stdio: 'inherit',
      timeout: 600000 // 10 minutes timeout for production startup
    })

    // Wait for all services to be healthy
    console.log('🏥 Waiting for services to be healthy...')
    await waitForServicesHealthy()

    // Setup test database and data
    console.log('🗄️  Setting up test database...')
    await setupTestDatabase()

    // Create test user and data
    console.log('👤 Setting up test data...')
    await setupTestData()

    console.log('✅ Production environment setup complete!')

  } catch (error) {
    console.error('❌ Production environment setup failed:', error.message)
    // Cleanup on failure
    try {
      execSync('docker-compose -f ../docker-compose.prod.yml down -v', { stdio: 'inherit' })
    } catch (cleanupError) {
      console.error('❌ Cleanup failed:', cleanupError.message)
    }
    throw error
  }
}

/**
 * Check production configuration
 */
async function checkProductionConfig() {
  try {
    // Check if .env.production exists
    execSync('test -f ../.env.production', { stdio: 'pipe' })
    console.log('✅ Production environment file found')
  } catch (error) {
    console.error('❌ Production environment file (.env.production) not found')
    console.log('Creating minimal production environment file for testing...')

    // Create minimal production config for testing
    const prodConfig = `
JWT_SECREAT_KEY=test_production_jwt_secret_key_for_e2e_testing_minimum_32_chars
DB_USER=chinook_user
DB_PASSWORD=test_production_db_password_for_e2e
CORS_ORIGIN=http://localhost:80,http://localhost:443
`
    execSync(`echo "${prodConfig.trim()}" > ../.env.production`, { stdio: 'inherit' })
    console.log('✅ Minimal production environment file created')
  }
}

/**
 * Wait for all services to be healthy
 */
async function waitForServicesHealthy() {
  const services = [
    { name: 'postgres', url: 'http://localhost:5432', healthCheck: checkPostgresHealth },
    { name: 'auth', url: 'http://localhost:3000/health', healthCheck: checkHttpHealth },
    { name: 'app', url: 'http://localhost:3001/health', healthCheck: checkHttpHealth },
    { name: 'catalogos', url: 'http://localhost:3002/health', healthCheck: checkHttpHealth },
    { name: 'web', url: 'http://localhost:80/', healthCheck: checkHttpHealth },
    { name: 'redis', url: 'http://localhost:6379', healthCheck: checkRedisHealth }
  ]

  for (const service of services) {
    console.log(`⏳ Waiting for ${service.name} service...`)
    let healthy = false
    let attempts = 0
    const maxAttempts = 120 // 4 minutes with 2-second intervals

    while (!healthy && attempts < maxAttempts) {
      try {
        await service.healthCheck(service.url)
        healthy = true
        console.log(`✅ ${service.name} service is healthy`)
      } catch (error) {
        attempts++
        if (attempts % 15 === 0) {
          console.log(`⏳ Still waiting for ${service.name}... (attempt ${attempts}/${maxAttempts})`)
        }
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    if (!healthy) {
      throw new Error(`${service.name} service failed to become healthy within timeout period`)
    }
  }
}

/**
 * Check HTTP service health
 */
async function checkHttpHealth(url) {
  const response = await fetch(url, {
    method: 'GET',
    timeout: 10000
  })
  if (!response.ok) {
    throw new Error(`HTTP health check failed: ${response.status}`)
  }
}

/**
 * Check PostgreSQL health
 */
async function checkPostgresHealth() {
  // Use docker exec to check PostgreSQL health
  execSync('docker exec chinook-postgres-prod pg_isready -U chinook_user -d chinook', {
    stdio: 'pipe'
  })
}

/**
 * Check Redis health
 */
async function checkRedisHealth() {
  // Use docker exec to check Redis health
  execSync('docker exec chinook-redis-prod redis-cli ping', {
    stdio: 'pipe'
  })
}

/**
 * Setup test database for production environment
 */
async function setupTestDatabase() {
  try {
    // Run database migrations
    console.log('🔄 Running database migrations...')
    execSync('docker-compose -f ../docker-compose.prod.yml exec -T db-migrate npm run migrate-all', {
      stdio: 'inherit'
    })

    // Seed test data if needed
    console.log('🌱 Seeding test data...')
    // Add seeding logic here if needed

    console.log('✅ Test database setup complete')
  } catch (error) {
    console.error('❌ Test database setup failed:', error.message)
    throw error
  }
}

/**
 * Setup test data for production environment
 */
async function setupTestData() {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Navigate to the application
    await page.goto('http://localhost:80/')

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
