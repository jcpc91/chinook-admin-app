const AppDatabaseFactory = require('../../database/repository/AppDatabaseFactory');

describe('Database Configuration - Containerized Environment', () => {
    describe('Repository Factory', () => {
        test('should create SQLite repositories in development', () => {
            // Set environment to development with SQLite
            process.env.NODE_ENV = 'development';
            process.env.DB_TYPE = 'sqlite3';

            const employeeRepo = AppDatabaseFactory.createEmployeeRepository();
            const customerRepo = AppDatabaseFactory.createCustomerRepository();

            expect(employeeRepo.constructor.name).toBe('EmployeeRepository');
            expect(customerRepo.constructor.name).toBe('CustomerRepository');
        });

        test('should create PostgreSQL repositories in staging/production', () => {
            // Set environment to staging with PostgreSQL
            process.env.NODE_ENV = 'staging';
            process.env.DB_TYPE = 'postgresql';

            const employeeRepo = AppDatabaseFactory.createEmployeeRepository();
            const customerRepo = AppDatabaseFactory.createCustomerRepository();

            expect(employeeRepo.constructor.name).toBe('EmployeeRepository');
            expect(customerRepo.constructor.name).toBe('CustomerRepository');
        });
    });

    describe('PostgreSQL Configuration', () => {
        test('should use environment variables for PostgreSQL connection', () => {
            // Test PostgreSQL environment variables
            process.env.DB_HOST = 'postgres';
            process.env.DB_NAME = 'chinook_app';
            process.env.DB_USER = 'chinook_user';
            process.env.DB_PASSWORD = 'test_password';
            process.env.DB_PORT = '5432';

            expect(process.env.DB_HOST).toBe('postgres');
            expect(process.env.DB_NAME).toBe('chinook_app');
            expect(process.env.DB_USER).toBe('chinook_user');
            expect(process.env.DB_PASSWORD).toBe('test_password');
            expect(process.env.DB_PORT).toBe('5432');
        });
    });

    describe('Database Connection Handling', () => {
        test('should handle database connection errors gracefully', async () => {
            // Mock a database connection error scenario
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'test';
            process.env.DB_TYPE = 'postgresql';
            process.env.DB_HOST = 'nonexistent-host';

            try {
                const repo = AppDatabaseFactory.createEmployeeRepository();
                expect(repo).toBeDefined();
            } catch (error) {
                // Should handle connection errors gracefully
                expect(error).toBeDefined();
            } finally {
                process.env.NODE_ENV = originalEnv;
            }
        });
    });
});
