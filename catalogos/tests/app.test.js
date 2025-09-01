const request = require('supertest');
const app = require('../src/app');

describe('Catalogos Service', () => {
  describe('Health Check', () => {
    test('GET /health should return 200 and status OK', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Root Endpoint', () => {
    test('GET / should return service information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Catalogos API is running');
      expect(response.body).toHaveProperty('version', '1.0.0');
    });
  });

  describe('Authentication', () => {
    test('Protected routes should return 401 without token', async () => {
      await request(app)
        .get('/api/generos')
        .expect(401);
    });

    test('Protected routes should return 401 with invalid token', async () => {
      await request(app)
        .get('/api/generos')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Error Handling', () => {
    test('Non-existent routes should return 404', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Route not found');
      expect(response.body).toHaveProperty('path', '/api/nonexistent');
      expect(response.body).toHaveProperty('method', 'GET');
    });
  });

  describe('CORS Configuration', () => {
    test('Should include CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});
