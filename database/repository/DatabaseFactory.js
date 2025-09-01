const SqliteValidUserRepository = require("./sqliteRepository/ValidUserRepository");
const PostgresValidUserRepository = require("./postgresRepository/ValidUserRepository");

class DatabaseFactory {
    static createValidUserRepository() {
        const dbType = process.env.DB_TYPE || 'sqlite3';
        const environment = process.env.NODE_ENV || 'development';

        console.log(`Creating ValidUserRepository for ${dbType} in ${environment} environment`);

        switch (dbType) {
            case 'postgresql':
                return new PostgresValidUserRepository();
            case 'sqlite3':
            default:
                return new SqliteValidUserRepository();
        }
    }
}

module.exports = DatabaseFactory;
