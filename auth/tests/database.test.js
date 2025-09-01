const DatabaseFactory = require('../../database/repository/DatabaseFactory');

// Mock the repository classes
jest.mock('../../database/repository/sqliteRepository/ValidUserRepository');
jest.mock('../../database/repository/postgresRepository/ValidUserRepository');

const SqliteValidUserRepository = require('../../database/repository/sqliteRepository/ValidUserRepository');
const PostgresValidUserRepository = require('../../database/repository/postgresRepository/ValidUserRepository');

describe('Database Factory', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset environment variables
        delete process.env.DB_TYPE;
        delete process.env.NODE_ENV;
    });

    describe('createValidUserRepository', () => {
        it('should create SQLite repository for development environment', () => {
            process.env.DB_TYPE = 'sqlite3';
            process.env.NODE_ENV = 'development';

            const repository = DatabaseFactory.createValidUserRepository();

            expect(SqliteValidUserRepository).toHaveBeenCalled();
            expect(PostgresValidUserRepository).not.toHaveBeenCalled();
        });

        it('should create PostgreSQL repository for staging environment', () => {
            process.env.DB_TYPE = 'postgresql';
            process.env.NODE_ENV = 'staging';

            const repository = DatabaseFactory.createValidUserRepository();

            expect(PostgresValidUserRepository).toHaveBeenCalled();
            expect(SqliteValidUserRepository).not.toHaveBeenCalled();
        });

        it('should create PostgreSQL repository for production environment', () => {
            process.env.DB_TYPE = 'postgresql';
            process.env.NODE_ENV = 'production';

            const repository = DatabaseFactory.createValidUserRepository();

            expect(PostgresValidUserRepository).toHaveBeenCalled();
            expect(SqliteValidUserRepository).not.toHaveBeenCalled();
        });

        it('should default to SQLite repository when DB_TYPE is not specified', () => {
            process.env.NODE_ENV = 'development';

            const repository = DatabaseFactory.createValidUserRepository();

            expect(SqliteValidUserRepository).toHaveBeenCalled();
            expect(PostgresValidUserRepository).not.toHaveBeenCalled();
        });

        it('should default to SQLite repository for unknown DB_TYPE', () => {
            process.env.DB_TYPE = 'unknown';
            process.env.NODE_ENV = 'development';

            const repository = DatabaseFactory.createValidUserRepository();

            expect(SqliteValidUserRepository).toHaveBeenCalled();
            expect(PostgresValidUserRepository).not.toHaveBeenCalled();
        });

        it('should handle missing environment variables gracefully', () => {
            const repository = DatabaseFactory.createValidUserRepository();

            expect(SqliteValidUserRepository).toHaveBeenCalled();
            expect(PostgresValidUserRepository).not.toHaveBeenCalled();
        });
    });
});
