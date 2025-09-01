module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.container.js'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  testTimeout: 30000, // Increased timeout for container tests
  // Container-specific settings
  maxWorkers: 1, // Run tests sequentially in containers
  // Retry failed tests once in case of timing issues
  jest: {
    retries: 1
  }
};
