// Test setup for containerized app service with PostgreSQL
require('dotenv').config();

// Set test environment variables for containerized testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.CORS_ORIGIN = 'http://web:5173';
process.env.JWT_SECREAT_KEY = 'test-jwt-secret-key-for-containers';

// PostgreSQL configuration for containerized tests
process.env.DB_TYPE = 'postgresql';
process.env.DB_HOST = process.env.DB_HOST || 'postgres-test';
process.env.DB_NAME = process.env.DB_NAME || 'chinook_app_test';
process.env.DB_USER = process.env.DB_USER || 'test_user';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test_password';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_POOL_MIN = '1';
process.env.DB_POOL_MAX = '5';
process.env.DB_TIMEOUT = '10000';

// Suppress console logs during testing unless explicitly needed
if (process.env.VERBOSE_TESTS !== 'true') {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
}

// Global test setup
beforeAll(async () => {
    // Wait for database to be ready
    const knex = require('knex');
    const config = require('../src/config/database');

    let retries = 30;
    while (retries > 0) {
        try {
            const db = knex(config.test || config.development);
            await db.raw('SELECT 1');
            await db.destroy();
            break;
        } catch (error) {
            retries--;
            if (retries === 0) {
                throw new Error('Database not ready after 30 attempts');
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
});

// Global test teardown
afterAll(async () => {
    // Close any open database connections
    if (global.db) {
        await global.db.destroy();
    }

    // Give Jest time to clean up
    await new Promise(resolve => setTimeout(resolve, 100));
});
