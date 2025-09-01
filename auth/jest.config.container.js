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
    verbose: true,
    // Container-specific settings
    maxWorkers: 1, // Run tests sequentially in containers
    forceExit: true,
    detectOpenHandles: true,
    // Retry failed tests once in case of timing issues
    jest: {
        retries: 1
    }
};
