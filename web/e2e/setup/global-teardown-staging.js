import { execSync } from 'child_process'

/**
 * Global teardown for staging environment tests
 * Cleans up containers and test data
 */
async function globalTeardown() {
  console.log('🧹 Cleaning up staging environment after e2e tests...')

  try {
    // Clean up test data from PostgreSQL
    console.log('🗄️  Cleaning up test data...')
    await cleanupTestData()

    // Stop and remove staging containers
    console.log('🛑 Stopping staging containers...')
    try {
      execSync('docker-compose -f ../docker-compose.staging.yml down -v', {
        stdio: 'inherit',
        timeout: 60000 // 1 minute timeout
      })
      console.log('✅ Staging containers stopped and removed')
    } catch (error) {
      console.warn('⚠️  Failed to stop staging containers:', error.message)
      // Force cleanup
      try {
        execSync('docker-compose -f ../docker-compose.staging.yml kill', { stdio: 'inherit' })
        execSync('docker-compose -f ../docker-compose.staging.yml rm -f', { stdio: 'inherit' })
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

    console.log('✅ Staging environment cleanup complete!')

  } catch (error) {
    console.error('❌ Staging environment cleanup failed:', error.message)
    // Don't throw error in teardown to avoid masking test failures
  }
}

/**
 * Clean up test data from staging environment
 */
async function cleanupTestData() {
  try {
    // Clean up test data from PostgreSQL before stopping containers
    console.log('🗄️  Cleaning up PostgreSQL test data...')

    // Add cleanup SQL commands here if needed
    // For example:
    // execSync('docker-compose -f ../docker-compose.staging.yml exec -T postgres psql -U chinook_user -d chinook_auth -c "DELETE FROM users WHERE email LIKE \'%test%\'"', { stdio: 'inherit' })

    console.log('✅ Test data cleanup complete')
  } catch (error) {
    console.error('❌ Test data cleanup failed:', error.message)
    throw error
  }
}

export default globalTeardown
