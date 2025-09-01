// Test setup for containerized catalogos service with PostgreSQL
require('dotenv').config({ path: '.env.test' });

// Set test environment variables for containerized testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECREAT_KEY = 'test-secret-key-for-containers';
process.env.CORS_ORIGIN = 'http://web:5173';
process.env.PORT = '3002';

// PostgreSQL configuration for containerized tests
process.env.DB_TYPE = 'postgresql';
process.env.DB_HOST = process.env.DB_HOST || 'postgres-test';
process.env.DB_NAME = process.env.DB_NAME || 'chinook_catalogos_test';
process.env.DB_USER = process.env.DB_USER || 'test_user';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test_password';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_POOL_MIN = '1';
process.env.DB_POOL_MAX = '5';
process.env.DB_TIMEOUT = '10000';

// Mock console.log to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

if (process.env.VERBOSE_TESTS !== 'true') {
    console.log = (...args) => {
        // Only log if it's not a database connection message
        if (!args[0] || !args[0].includes('Conectado a la base de datos')) {
            // Still suppress most logs during tests
        }
    };
    console.error = jest.fn();
    console.warn = jest.fn();
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

// Cleanup after tests
afterAll(async () => {
    // Close any open database connections
    if (global.db) {
        await global.db.destroy();
    }

    // Give time for any async operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));
});
