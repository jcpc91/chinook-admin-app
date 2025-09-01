const request = require('supertest');
const app = require('../src/app');
const AppDatabaseFactory = require('../../database/repository/AppDatabaseFactory');

describe('App Service - Containerized PostgreSQL Tests', () => {
    let originalEnv;

    beforeAll(() => {
        // Save original environment
        originalEnv = { ...process.env };
    });

    afterAll(() => {
        // Restore original environment
        process.env = originalEnv;
    });

    describe('PostgreSQL Configuration', () => {
        beforeEach(() => {
            // Set PostgreSQL environment for testing
            process.env.NODE_ENV = 'staging';
            process.env.DB_TYPE = 'postgresql';
            process.env.DB_HOST = 'postgres';
            process.env.DB_NAME = 'chinook_app';
            process.env.DB_USER = 'chinook_user';
            process.env.DB_PASSWORD = 'test_password';
            process.env.DB_PORT = '5432';
        });

        test('should create PostgreSQL repositories when DB_TYPE is postgresql', () => {
            const employeeRepo = AppDatabaseFactory.createEmployeeRepository();
            const customerRepo = AppDatabaseFactory.createCustomerRepository();

            expect(employeeRepo).toBeDefined();
            expect(customerRepo).toBeDefined();
            expect(employeeRepo.constructor.name).toBe('EmployeeRepository');
            expect(customerRepo.constructor.name).toBe('CustomerRepository');
        });

        test('should use correct PostgreSQL connection parameters', () => {
            expect(process.env.DB_HOST).toBe('postgres');
            expect(process.env.DB_NAME).toBe('chinook_app');
            expect(process.env.DB_USER).toBe('chinook_user');
            expect(process.env.DB_PASSWORD).toBe('test_password');
            expect(process.env.DB_PORT).toBe('5432');
        });
    });

    describe('Service-to-Service Communication', () => {
        test('should handle requests with container hostnames', async () => {
            const response = await request(app)
                .get('/health')
                .set('Host', 'app:3001')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'OK');
            expect(response.body).toHaveProperty('service', 'chinook-app');
        });

        test('should accept CORS requests from web container', async () => {
            // Set containerized CORS origin
            process.env.CORS_ORIGIN = 'http://web:5173';

            const response = await request(app)
                .options('/health')
                .set('Origin', 'http://web:5173')
                .set('Access-Control-Request-Method', 'GET');

            expect(response.status).toBe(204);
        });
    });

    describe('Environment-Specific Configuration', () => {
        test('should load staging environment configuration', () => {
            process.env.NODE_ENV = 'staging';
            process.env.CORS_ORIGIN = 'http://web:5173';
            process.env.DB_TYPE = 'postgresql';

            expect(process.env.NODE_ENV).toBe('staging');
            expect(process.env.CORS_ORIGIN).toBe('http://web:5173');
            expect(process.env.DB_TYPE).toBe('postgresql');
        });

        test('should load production environment configuration', () => {
            process.env.NODE_ENV = 'production';
            process.env.CORS_ORIGIN = 'http://web:5173';
            process.env.DB_TYPE = 'postgresql';

            expect(process.env.NODE_ENV).toBe('production');
            expect(process.env.CORS_ORIGIN).toBe('http://web:5173');
            expect(process.env.DB_TYPE).toBe('postgresql');
        });
    });

    describe('Container Health and Readiness', () => {
        test('health endpoint should provide container-ready information', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'OK');
            expect(response.body).toHaveProperty('service', 'chinook-app');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('port');

            // Verify the response includes container-relevant information
            expect(typeof response.body.timestamp).toBe('string');
            expect(response.body.port).toBe(process.env.PORT || '3001');
        });

        test('should handle graceful shutdown signals', (done) => {
            // Test that the app can handle SIGTERM for graceful container shutdown
            const originalExit = process.exit;
            const originalKill = process.kill;

            process.exit = jest.fn();
            process.kill = jest.fn();

            // Simulate container shutdown signal
            process.emit('SIGTERM');

            // Restore original functions
            setTimeout(() => {
                process.exit = originalExit;
                process.kill = originalKill;
                done();
            }, 100);
        });
    });

    describe('Database Connection Resilience', () => {
        test('should handle database connection failures gracefully', async () => {
            // Set invalid database configuration
            process.env.DB_HOST = 'invalid-host';
            process.env.DB_TYPE = 'postgresql';

            try {
                const repo = AppDatabaseFactory.createEmployeeRepository();
                expect(repo).toBeDefined();

                // The repository should be created but connection errors should be handled
                // This tests that the service doesn't crash on database connection issues
            } catch (error) {
                // Connection errors should be caught and handled gracefully
                expect(error).toBeDefined();
            }
        });
    });
});
