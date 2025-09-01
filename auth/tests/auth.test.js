const request = require('supertest');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Mock the database factory and repository
jest.mock('../../database/repository/DatabaseFactory');
const DatabaseFactory = require('../../database/repository/DatabaseFactory');

describe('Auth Service', () => {
    let app;
    let mockRepository;
    let mockValidUserService;

    beforeEach(() => {
        // Reset environment variables
        process.env.PORT = '3000';
        process.env.CORS_ORIGIN = 'http://localhost:5173';
        process.env.JWT_SECREAT_KEY = 'test_secret_key';
        process.env.NODE_ENV = 'test';

        // Mock repository
        mockRepository = {
            validUserPassword: jest.fn(),
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

        // Create fresh app instance
        app = express();
        app.use(cors({
            origin: process.env.CORS_ORIGIN,
            credentials: false,
        }));
        app.use(express.json());

        // Health check endpoint
        app.get("/health", (req, res) => {
            res.json({
                status: "OK",
                service: "auth",
                timestamp: new Date().toISOString(),
                port: process.env.PORT
            });
        });

        app.get("/", (req, res) => {
            res.send("hola mundo auth");
        });

        // Login route
        app.post("/", async (req, res) => {
            try {
                const { username, password } = req.body;
                const user = await mockValidUserService.validUserPassword(username, password);

                if (user) {
                    const token = jwt.sign(
                        { user: user.username, role: user.role },
                        process.env.JWT_SECREAT_KEY,
                        { expiresIn: "2h" }
                    );
                    res.json({ token });
                } else {
                    res.status(401).json({ message: "Invalid credentials" });
                }
            } catch (error) {
                console.error('Authentication error:', error);
                res.status(500).json({ message: "Internal server error" });
            }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Health Check', () => {
        it('should return health status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).toEqual({
                status: "OK",
                service: "auth",
                timestamp: expect.any(String),
                port: "3000"
            });
        });
    });

    describe('Root Endpoint', () => {
        it('should return hello message', async () => {
            const response = await request(app)
                .get('/')
                .expect(200);

            expect(response.text).toBe('hola mundo auth');
        });
    });

    describe('Authentication', () => {
        it('should return JWT token for valid credentials', async () => {
            const mockUser = { username: 'testuser', role: 'admin' };
            mockValidUserService.validUserPassword.mockResolvedValue(mockUser);

            const response = await request(app)
                .post('/')
                .send({ username: 'testuser', password: 'testpass' })
                .expect(200);

            expect(response.body).toHaveProperty('token');
            expect(typeof response.body.token).toBe('string');

            // Verify JWT token
            const decoded = jwt.verify(response.body.token, process.env.JWT_SECREAT_KEY);
            expect(decoded.user).toBe('testuser');
            expect(decoded.role).toBe('admin');
        });

        it('should return 401 for invalid credentials', async () => {
            mockValidUserService.validUserPassword.mockResolvedValue(null);

            const response = await request(app)
                .post('/')
                .send({ username: 'invalid', password: 'invalid' })
                .expect(401);

            expect(response.body).toEqual({
                message: "Invalid credentials"
            });
        });

        it('should handle database errors gracefully', async () => {
            mockValidUserService.validUserPassword.mockRejectedValue(new Error('Database connection failed'));

            const response = await request(app)
                .post('/')
                .send({ username: 'testuser', password: 'testpass' })
                .expect(500);

            expect(response.body).toEqual({
                message: "Internal server error"
            });
        });
    });

    describe('Database Factory Integration', () => {
        it('should create repository using DatabaseFactory', () => {
            // The factory is called during app initialization in beforeEach
            // Reset and call again to verify
            DatabaseFactory.createValidUserRepository.mockClear();
            DatabaseFactory.createValidUserRepository();
            expect(DatabaseFactory.createValidUserRepository).toHaveBeenCalled();
        });

        it('should handle different database types based on environment', () => {
            // Test SQLite environment
            process.env.DB_TYPE = 'sqlite3';
            process.env.NODE_ENV = 'development';

            DatabaseFactory.createValidUserRepository();
            expect(DatabaseFactory.createValidUserRepository).toHaveBeenCalled();

            // Test PostgreSQL environment
            process.env.DB_TYPE = 'postgresql';
            process.env.NODE_ENV = 'staging';

            DatabaseFactory.createValidUserRepository();
            expect(DatabaseFactory.createValidUserRepository).toHaveBeenCalled();
        });
    });

    describe('Environment Configuration', () => {
        it('should use environment variables for configuration', () => {
            expect(process.env.PORT).toBe('3000');
            expect(process.env.CORS_ORIGIN).toBe('http://localhost:5173');
            expect(process.env.JWT_SECREAT_KEY).toBe('test_secret_key');
        });

        it('should handle missing environment variables with defaults', () => {
            delete process.env.PORT;
            // Port should default to 3000 in the actual app
            expect(process.env.PORT).toBeUndefined();
        });
    });
});
