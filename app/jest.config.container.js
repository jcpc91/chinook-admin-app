module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/**/*.test.js',
        '!**/node_modules/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.container.js'],
    testTimeout: 30000, // Increased timeout for container tests
    // Handle async operations and database connections
    forceExit: true,
    detectOpenHandles: true,
    // Container-specific settings
    maxWorkers: 1, // Run tests sequentially in containers
    verbose: true,
    // Environment variables for PostgreSQL testing
    testEnvironment: 'node',
    globalSetup: undefined,
    globalTeardown: undefined
};
