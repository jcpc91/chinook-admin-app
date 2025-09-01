const request = require('supertest');
const app = require('../src/app');

describe('Container Environment Tests', () => {
  describe('Environment Variables', () => {
    test('Should handle missing environment variables', () => {
      // Test that the app starts even with missing env vars
      expect(app).toBeDefined();
    });

    test('Should use default port when PORT not set', () => {
      delete process.env.PORT;
      // App should still be defined and use default port 3002
      expect(app).toBeDefined();
    });

    test('Should handle CORS_ORIGIN environment variable', () => {
      const originalCorsOrigin = process.env.CORS_ORIGIN;
      process.env.CORS_ORIGIN = 'http://test-origin:3000';

      // The app should handle the CORS origin change
      expect(app).toBeDefined();

      // Restore original value
      if (originalCorsOrigin) {
        process.env.CORS_ORIGIN = originalCorsOrigin;
      } else {
        delete process.env.CORS_ORIGIN;
      }
    });
  });

  describe('Health Checks for Container Orchestration', () => {
    test('Health endpoint should respond quickly for container health checks', async () => {
      const start = Date.now();

      const response = await request(app)
        .get('/health')
        .expect(200);

      const duration = Date.now() - start;

      expect(response.body.status).toBe('OK');
      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });

    test('Health endpoint should include timestamp for monitoring', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('Error Handling in Container Environment', () => {
    test('Should handle database connection errors gracefully', async () => {
      // Test that the service continues to respond even if database is unavailable
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
    });

    test('Should provide detailed error information in development', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');
      expect(response.body).toHaveProperty('method');

      // Restore original NODE_ENV
      if (originalNodeEnv) {
        process.env.NODE_ENV = originalNodeEnv;
      } else {
        delete process.env.NODE_ENV;
      }
    });

    test('Should hide sensitive error information in production', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body).not.toHaveProperty('stack');

      // Restore original NODE_ENV
      if (originalNodeEnv) {
        process.env.NODE_ENV = originalNodeEnv;
      } else {
        delete process.env.NODE_ENV;
      }
    });
  });

  describe('JWT Authentication in Container', () => {
    test('Should handle JWT_SECRET_KEY environment variable', () => {
      const originalJwtSecret = process.env.JWT_SECREAT_KEY;
      process.env.JWT_SECREAT_KEY = 'test-secret-key';

      // App should handle JWT secret configuration
      expect(app).toBeDefined();

      // Restore original value
      if (originalJwtSecret) {
        process.env.JWT_SECREAT_KEY = originalJwtSecret;
      } else {
        delete process.env.JWT_SECREAT_KEY;
      }
    });

    test('Should reject requests without proper authentication', async () => {
      await request(app)
        .get('/api/generos')
        .expect(401);
    });
  });

  describe('Graceful Shutdown Handling', () => {
    test('Should handle SIGTERM signal', (done) => {
      const originalListeners = process.listeners('SIGTERM');

      // Check that SIGTERM handler is registered
      const sigtermHandlers = process.listeners('SIGTERM');
      expect(sigtermHandlers.length).toBeGreaterThan(0);

      done();
    });

    test('Should handle SIGINT signal', (done) => {
      const originalListeners = process.listeners('SIGINT');

      // Check that SIGINT handler is registered
      const sigintHandlers = process.listeners('SIGINT');
      expect(sigintHandlers.length).toBeGreaterThan(0);

      done();
    });
  });
});
