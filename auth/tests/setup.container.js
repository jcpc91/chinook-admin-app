// Test setup for containerized auth service with PostgreSQL
require('dotenv').config();

// Set test environment variables for containerized testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECREAT_KEY = 'test-secret-key-for-containers';
process.env.CORS_ORIGIN = 'http://web:5173';
process.env.PORT = '3000';

// PostgreSQL configuration for containerized tests
process.env.DB_TYPE = 'postgresql';
process.env.DB_HOST = process.env.DB_HOST || 'postgres-test';
process.env.DB_NAME = process.env.DB_NAME || 'chinook_auth_test';
process.env.DB_USER = process.env.DB_USER || 'test_user';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test_password';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_POOL_MIN = '1';
process.env.DB_POOL_MAX = '5';
process.env.DB_TIMEOUT = '10000';

// Suppress console logs during testing unless explicitly needed
if (process.env.VERBOSE_TESTS !== 'true') {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();

    // Restore console functions after each test if needed
    afterEach(() => {
        if (process.env.RESTORE_CONSOLE === 'true') {
            console.log = originalConsoleLog;
            console.error = originalConsoleError;
            console.warn = originalConsoleWarn;
        }
    });
}

// Global test setup
beforeAll(async () => {
    // Wait for database to be ready
    const knex = require('knex');

    // Basic PostgreSQL connection config for testing
    const testConfig = {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        },
        pool: {
            min: parseInt(process.env.DB_POOL_MIN),
            max: parseInt(process.env.DB_POOL_MAX)
        },
        acquireConnectionTimeout: parseInt(process.env.DB_TIMEOUT)
    };

    let retries = 30;
    while (retries > 0) {
        try {
            const db = knex(testConfig);
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
