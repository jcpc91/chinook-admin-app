// Test setup for containerized app service
require('dotenv').config();

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.JWT_SECREAT_KEY = 'test-jwt-secret-key';
process.env.DB_TYPE = 'sqlite3';

// Suppress console logs during testing unless explicitly needed
if (process.env.VERBOSE_TESTS !== 'true') {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
}

// Global test teardown
afterAll(async () => {
    // Close any open database connections
    if (global.db) {
        await global.db.destroy();
    }

    // Give Jest time to clean up
    await new Promise(resolve => setTimeout(resolve, 100));
});
