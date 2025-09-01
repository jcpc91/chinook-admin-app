const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Mock knex and path modules
jest.mock('knex');
jest.mock('path');

const knex = require('knex');
const path = require('path');

describe('Catalogos Service - Health Check', () => {
    let app;
    let mockDb;

    beforeEach(() => {
        // Reset environment variables
        process.env.PORT = '3002';
        process.env.CORS_ORIGIN = 'http://localhost:5173';
        process.env.NODE_ENV = 'test';
        process.env.DB_TYPE = 'sqlite3';

        // Mock database instance
        mockDb = {
            raw: jest.fn(),
            destroy: jest.fn()
        };

        // Mock knex constructor
        knex.mockReturnValue(mockDb);

        // Mock path.resolve
        path.resolve.mockReturnValue('/mocked/path/to/knexfile.js');

        // Mock knexfile
        jest.doMock('/mocked/path/to/knexfile.js', () => ({
            test: {
                client: 'sqlite3',
                connection: {
                    filename: ':memory:'
                }
            }
        }), { virtual: true });

        // Create fresh app instance with enhanced health check
        app = express();
        app.use(cors({
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        }));
        app.use(express.json());

        const PORT = process.env.PORT || 3002;
        const NODE_ENV = process.env.NODE_ENV || 'development';
        const DB_TYPE = process.env.DB_TYPE || 'sqlite3';

        // Enhanced health check endpoint
        app.get("/health", async (req, res) => {
            const healthCheck = {
                status: "OK",
                service: "catalogos",
                timestamp: new Date().toISOString(),
                port: PORT,
                environment: NODE_ENV,
                database: {
                    status: "unknown",
                    type: DB_TYPE
                }
            };

            try {
                // Test database connectivity
                const knex = require('knex');
                const path = require('path');
                const knexConfig = require(path.resolve(__dirname, '../../database/catalogos/knexfile.js'));

                const db = knex(knexConfig[NODE_ENV]);

                // Simple connectivity test
                await db.raw('SELECT 1 as test');
                healthCheck.database.status = "connected";

                // Clean up connection
                await db.destroy();
            } catch (error) {
                console.error('Health check database error:', error.message);
                healthCheck.database.status = "error";
                healthCheck.database.error = error.message;
                healthCheck.status = "DEGRADED";
            }

            // Return appropriate HTTP status based on health
            const httpStatus = healthCheck.status === "OK" ? 200 : 503;
            res.status(httpStatus).json(healthCheck);
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    describe('Enhanced Health Check', () => {
        it('should return healthy status when database is connected', async () => {
            mockDb.raw.mockResolvedValue([{ test: 1 }]);
            mockDb.destroy.mockResolvedValue();

            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).toEqual({
                status: "OK",
                service: "catalogos",
                timestamp: expect.any(String),
                port: "3002",
                environment: "test",
                database: {
                    status: "connected",
                    type: "sqlite3"
                }
            });

            expect(mockDb.raw).toHaveBeenCalledWith('SELECT 1 as test');
            expect(mockDb.destroy).toHaveBeenCalled();
        });

        it('should return degraded status when database connection fails', async () => {
            const dbError = new Error('Database connection failed');
            mockDb.raw.mockRejectedValue(dbError);

            const response = await request(app)
                .get('/health')
                .expect(503);

            expect(response.body).toEqual({
                status: "DEGRADED",
                service: "catalogos",
                timestamp: expect.any(String),
                port: "3002",
                environment: "test",
                database: {
                    status: "error",
                    type: "sqlite3",
                    error: "Database connection failed"
                }
            });

            expect(mockDb.raw).toHaveBeenCalledWith('SELECT 1 as test');
        });

        it('should respond quickly for container health checks', async () => {
            mockDb.raw.mockResolvedValue([{ test: 1 }]);
            mockDb.destroy.mockResolvedValue();

            const start = Date.now();
            const response = await request(app)
                .get('/health')
                .expect(200);

            const duration = Date.now() - start;
            expect(duration).toBeLessThan(1000); // Should respond within 1 second

            expect(response.body.status).toBe("OK");
        });

        it('should include timestamp for monitoring', async () => {
            mockDb.raw.mockResolvedValue([{ test: 1 }]);
            mockDb.destroy.mockResolvedValue();

            const beforeRequest = new Date().toISOString();
            const response = await request(app)
                .get('/health')
                .expect(200);

            const afterRequest = new Date().toISOString();

            expect(response.body.timestamp).toBeDefined();
            expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
            expect(response.body.timestamp >= beforeRequest).toBe(true);
            expect(response.body.timestamp <= afterRequest).toBe(true);
        });
    });
});
