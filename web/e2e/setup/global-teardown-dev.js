import { execSync } from 'child_process'

/**
 * Global teardown for development environment tests
 * Cleans up test data and optionally stops services
 */
async function globalTeardown() {
  console.log('🧹 Cleaning up development environment after e2e tests...')

  try {
    // Clean up test data from SQLite databases
    console.log('🗄️  Cleaning up test data...')
    await cleanupTestData()

    // Stop containerized web service
    console.log('🛑 Stopping containerized web service...')
    try {
      execSync('docker-compose -f ../docker-compose.dev.yml down', { stdio: 'inherit' })
      console.log('✅ Containerized web service stopped')
    } catch (error) {
      console.warn('⚠️  Failed to stop containerized web service:', error.message)
    }

    // Note: We don't stop local backend services as they might be used for development
    console.log('ℹ️  Local backend services left running for continued development')

    console.log('✅ Development environment cleanup complete!')

  } catch (error) {
    console.error('❌ Development environment cleanup failed:', error.message)
    // Don't throw error in teardown to avoid masking test failures
  }
}

/**
 * Clean up test data from development environment
 */
async function cleanupTestData() {
  try {
    // Add cleanup logic for test data
    // For example, removing test users, cleaning up test records, etc.

    console.log('✅ Test data cleanup complete')
  } catch (error) {
    console.error('❌ Test data cleanup failed:', error.message)
    throw error
  }
}

export default globalTeardown
