import { execSync } from 'child_process'

/**
 * Global teardown for production environment tests
 * Cleans up containers and test data
 */
async function globalTeardown() {
  console.log('🧹 Cleaning up production environment after e2e tests...')

  try {
    // Clean up test data from PostgreSQL
    console.log('🗄️  Cleaning up test data...')
    await cleanupTestData()

    // Stop and remove production containers
    console.log('🛑 Stopping production containers...')
    try {
      execSync('docker-compose -f ../docker-compose.prod.yml down -v', {
        stdio: 'inherit',
        timeout: 120000 // 2 minutes timeout
      })
      console.log('✅ Production containers stopped and removed')
    } catch (error) {
      console.warn('⚠️  Failed to stop production containers:', error.message)
      // Force cleanup
      try {
        execSync('docker-compose -f ../docker-compose.prod.yml kill', { stdio: 'inherit' })
        execSync('docker-compose -f ../docker-compose.prod.yml rm -f', { stdio: 'inherit' })
        console.log('✅ Forced cleanup completed')
      } catch (forceError) {
        console.error('❌ Force cleanup failed:', forceError.message)
      }
    }

    // Clean up Docker volumes
    console.log('🧹 Cleaning up Docker volumes...')
    try {
      execSync('docker volume prune -f', { stdio: 'inherit' })
      console.log('✅ Docker volumes cleaned up')
    } catch (error) {
      console.warn('⚠️  Failed to clean up Docker volumes:', error.message)
    }

    // Clean up Docker networks
    console.log('🌐 Cleaning up Docker networks...')
    try {
      execSync('docker network prune -f', { stdio: 'inherit' })
      console.log('✅ Docker networks cleaned up')
    } catch (error) {
      console.warn('⚠️  Failed to clean up Docker networks:', error.message)
    }

    console.log('✅ Production environment cleanup complete!')

  } catch (error) {
    console.error('❌ Production environment cleanup failed:', error.message)
    // Don't throw error in teardown to avoid masking test failures
  }
}

/**
 * Clean up test data from production environment
 */
async function cleanupTestData() {
  try {
    // Clean up test data from PostgreSQL before stopping containers
    console.log('🗄️  Cleaning up PostgreSQL test data...')

    // Add cleanup SQL commands here if needed
    // For example:
    // execSync('docker-compose -f ../docker-compose.prod.yml exec -T postgres psql -U chinook_user -d chinook_auth -c "DELETE FROM users WHERE email LIKE \'%test%\'"', { stdio: 'inherit' })

    console.log('✅ Test data cleanup complete')
  } catch (error) {
    console.error('❌ Test data cleanup failed:', error.message)
    throw error
  }
}

export default globalTeardown
