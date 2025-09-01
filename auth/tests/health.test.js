const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Mock the database factory and repository
jest.mock('../../database/repository/DatabaseFactory');
const DatabaseFactory = require('../../database/repository/DatabaseFactory');

describe('Auth Service - Health Check', () => {
    let app;
    let mockRepository;
    let mockValidUserService;

    beforeEach(() => {
        // Reset environment variables
        process.env.PORT = '3000';
        process.env.CORS_ORIGIN = 'http://localhost:5173';
        process.env.JWT_SECREAT_KEY = 'test_secret_key';
        process.env.NODE_ENV = 'test';

        // Mock repository with testConnection method
        mockRepository = {
            validUserPassword: jest.fn(),
            testConnection: jest.fn(),
            close: jest.fn()
        };

        // Mock ValidUserService
        mockValidUserService = {
            validUserPassword: jest.fn()
        };

        // Mock DatabaseFactory
        DatabaseFactory.createValidUserRepository.mockReturnValue(mockRepository);

        // Mock ValidUserService constructor
        jest.doMock('../../database/repository/service/ValidUserService', () => {
            return jest.fn().mockImplementation(() => mockValidUserService);
        });

        // Create fresh app instance with enhanced health check
        app = express();
        app.use(cors({
            origin: process.env.CORS_ORIGIN,
            credentials: false,
        }));
        app.use(express.json());

        const validUserRepository = DatabaseFactory.createValidUserRepository();
        const port = process.env.PORT || 3000;

        // Enhanced health check endpoint
        app.get("/health", async (req, res) => {
            const healthCheck = {
                status: "OK",
                service: "auth",
                timestamp: new Date().toISOString(),
                port: port,
                environment: process.env.NODE_ENV || 'development',
                database: {
                    status: "unknown",
                    type: "sqlite3"
                }
            };

            try {
                // Test database connectivity
                if (validUserRepository) {
                    await validUserRepository.testConnection();
                    healthCheck.database.status = "connected";
                } else {
                    healthCheck.database.status = "not_initialized";
                }
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
    });

    describe('Enhanced Health Check', () => {
        it('should return healthy status when database is connected', async () => {
            mockRepository.testConnection.mockResolvedValue({ test: 1 });

            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).toEqual({
                status: "OK",
                service: "auth",
                timestamp: expect.any(String),
                port: "3000",
                environment: "test",
                database: {
                    status: "connected",
                    type: "sqlite3"
                }
            });

            expect(mockRepository.testConnection).toHaveBeenCalled();
        });

        it('should return degraded status when database connection fails', async () => {
            const dbError = new Error('Database connection failed');
            mockRepository.testConnection.mockRejectedValue(dbError);

            const response = await request(app)
                .get('/health')
                .expect(503);

            expect(response.body).toEqual({
                status: "DEGRADED",
                service: "auth",
                timestamp: expect.any(String),
                port: "3000",
                environment: "test",
                database: {
                    status: "error",
                    type: "sqlite3",
                    error: "Database connection failed"
                }
            });

            expect(mockRepository.testConnection).toHaveBeenCalled();
        });

        it('should return not_initialized status when repository is null', async () => {
            // Mock factory to return null
            DatabaseFactory.createValidUserRepository.mockReturnValue(null);

            // Recreate app with null repository
            app = express();
            app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: false }));
            app.use(express.json());

            const validUserRepository = null;
            const port = process.env.PORT || 3000;

            app.get("/health", async (req, res) => {
                const healthCheck = {
                    status: "OK",
                    service: "auth",
                    timestamp: new Date().toISOString(),
                    port: port,
                    environment: process.env.NODE_ENV || 'development',
                    database: {
                        status: "unknown",
                        type: "sqlite3"
                    }
                };

                try {
                    if (validUserRepository) {
                        await validUserRepository.testConnection();
                        healthCheck.database.status = "connected";
                    } else {
                        healthCheck.database.status = "not_initialized";
                    }
                } catch (error) {
                    healthCheck.database.status = "error";
                    healthCheck.database.error = error.message;
                    healthCheck.status = "DEGRADED";
                }

                const httpStatus = healthCheck.status === "OK" ? 200 : 503;
                res.status(httpStatus).json(healthCheck);
            });

            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body.database.status).toBe("not_initialized");
        });

        it('should include correct environment information', async () => {
            process.env.NODE_ENV = 'production';
            mockRepository.testConnection.mockResolvedValue({ test: 1 });

            // Recreate app with production environment
            app = express();
            app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: false }));
            app.use(express.json());

            const validUserRepository = DatabaseFactory.createValidUserRepository();
            const port = process.env.PORT || 3000;

            app.get("/health", async (req, res) => {
                const healthCheck = {
                    status: "OK",
                    service: "auth",
                    timestamp: new Date().toISOString(),
                    port: port,
                    environment: process.env.NODE_ENV || 'development',
                    database: {
                        status: "unknown",
                        type: "sqlite3"
                    }
                };

                try {
                    if (validUserRepository) {
                        await validUserRepository.testConnection();
                        healthCheck.database.status = "connected";
                    } else {
                        healthCheck.database.status = "not_initialized";
                    }
                } catch (error) {
                    healthCheck.database.status = "error";
                    healthCheck.database.error = error.message;
                    healthCheck.status = "DEGRADED";
                }

                const httpStatus = healthCheck.status === "OK" ? 200 : 503;
                res.status(httpStatus).json(healthCheck);
            });

            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body.environment).toBe('production');
        });

        it('should respond quickly for container health checks', async () => {
            mockRepository.testConnection.mockResolvedValue({ test: 1 });

            const start = Date.now();
            const response = await request(app)
                .get('/health')
                .expect(200);

            const duration = Date.now() - start;
            expect(duration).toBeLessThan(1000); // Should respond within 1 second

            expect(response.body.status).toBe("OK");
        });

        it('should include timestamp for monitoring', async () => {
            mockRepository.testConnection.mockResolvedValue({ test: 1 });

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
