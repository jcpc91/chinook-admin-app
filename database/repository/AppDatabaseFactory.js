const SqliteEmployeeRepository = require("./sqliteRepository/EmployeeRepository");
const SqliteCustomerRepository = require("./sqliteRepository/CustomerRepository");
const PostgresEmployeeRepository = require("./postgresRepository/EmployeeRepository");
const PostgresCustomerRepository = require("./postgresRepository/CustomerRepository");

class AppDatabaseFactory {
    static createEmployeeRepository() {
        const dbType = process.env.DB_TYPE || 'sqlite3';
        const environment = process.env.NODE_ENV || 'development';

        console.log(`Creating EmployeeRepository for ${dbType} in ${environment} environment`);

        switch (dbType) {
            case 'postgresql':
                return new PostgresEmployeeRepository();
            case 'sqlite3':
            default:
                return new SqliteEmployeeRepository();
        }
    }

    static createCustomerRepository() {
        const dbType = process.env.DB_TYPE || 'sqlite3';
        const environment = process.env.NODE_ENV || 'development';

        console.log(`Creating CustomerRepository for ${dbType} in ${environment} environment`);

        switch (dbType) {
            case 'postgresql':
                return new PostgresCustomerRepository();
            case 'sqlite3':
            default:
                return new SqliteCustomerRepository();
        }
    }
}

module.exports = AppDatabaseFactory;
