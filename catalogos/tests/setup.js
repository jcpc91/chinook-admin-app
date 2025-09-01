// Test setup file
require('dotenv').config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECREAT_KEY = 'test-secret-key-for-testing';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.PORT = '3002';
process.env.DB_TYPE = 'sqlite3';

// Mock console.log to reduce noise in tests
const originalConsoleLog = console.log;
console.log = (...args) => {
  // Only log if it's not a database connection message
  if (!args[0] || !args[0].includes('Conectado a la base de datos')) {
    originalConsoleLog(...args);
  }
};

// Cleanup after tests
afterAll(async () => {
  // Give time for any async operations to complete
  await new Promise(resolve => setTimeout(resolve, 100));
});
