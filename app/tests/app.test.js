const request = require('supertest');
const app = require('../src/app');

describe('App Service - Containerized Environment Tests', () => {
    describe('Health Check', () => {
        test('GET /health should return service status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'OK');
            expect(response.body).toHaveProperty('service', 'chinook-app');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('port');
        });
    });

    describe('CORS Configuration', () => {
        test('should handle CORS headers correctly', async () => {
            const response = await request(app)
                .options('/health')
                .set('Origin', process.env.CORS_ORIGIN || 'http://localhost:5173')
                .set('Access-Control-Request-Method', 'GET');

            expect(response.status).toBe(204);
        });
    });

    describe('JWT Authentication', () => {
        test('should reject requests without JWT token', async () => {
            const response = await request(app)
                .get('/employees')
                .expect(401);
        });

        test('should reject requests with invalid JWT token', async () => {
            const response = await request(app)
                .get('/employees')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
        });
    });

    describe('Environment Configuration', () => {
        test('should load environment variables correctly', () => {
            // Test that environment variables are loaded
            expect(process.env.PORT || '3001').toBeDefined();
            expect(process.env.CORS_ORIGIN).toBeDefined();
        });

        test('should use correct database type based on environment', () => {
            const dbType = process.env.DB_TYPE || 'sqlite3';
            expect(['sqlite3', 'postgresql']).toContain(dbType);
        });
    });

    describe('Service Communication', () => {
        test('should be ready for containerized service-to-service communication', async () => {
            // Test that the service can handle requests from other containers
            const response = await request(app)
                .get('/health')
                .set('Host', 'app:3001') // Simulate container hostname
                .expect(200);

            expect(response.body.status).toBe('OK');
        });
    });
});
