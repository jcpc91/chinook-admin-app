// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
    development: {
        client: "sqlite3",
        connection: {
            filename: "../../.db/dev.sqlite3",
        },
    },

    staging: {
        client: "postgresql",
        connection: {
            host: process.env.DB_HOST || "postgres",
            database: process.env.DB_NAME || "chinook_app",
            user: process.env.DB_USER || "chinook_user",
            password: process.env.DB_PASSWORD || "secure_password",
            port: parseInt(process.env.DB_PORT) || 5432,
        },
        pool: {
            min: parseInt(process.env.DB_POOL_MIN) || 2,
            max: parseInt(process.env.DB_POOL_MAX) || 10,
            acquireTimeoutMillis: 60000,
            createTimeoutMillis: 30000,
            destroyTimeoutMillis: 5000,
            idleTimeoutMillis: 30000,
            reapIntervalMillis: 1000,
            createRetryIntervalMillis: 100,
        },
        migrations: {
            tableName: "knex_migrations",
        },
        acquireConnectionTimeout: 60000,
        useNullAsDefault: true,
    },

    test: {
        client: "postgresql",
        connection: {
            host: process.env.DB_HOST || "postgres-test",
            database: process.env.DB_NAME || "chinook_app_test",
            user: process.env.DB_USER || "test_user",
            password: process.env.DB_PASSWORD || "test_password",
            port: parseInt(process.env.DB_PORT) || 5432,
        },
        pool: {
            min: parseInt(process.env.DB_POOL_MIN) || 1,
            max: parseInt(process.env.DB_POOL_MAX) || 5,
            acquireTimeoutMillis: 30000,
            createTimeoutMillis: 15000,
            destroyTimeoutMillis: 5000,
            idleTimeoutMillis: 15000,
            reapIntervalMillis: 1000,
            createRetryIntervalMillis: 100,
        },
        migrations: {
            tableName: "knex_migrations",
        },
        acquireConnectionTimeout: 30000,
        useNullAsDefault: true,
    },

    production: {
        client: "postgresql",
        connection: {
            host: process.env.DB_HOST || "postgres",
            database: process.env.DB_NAME || "chinook_app",
            user: process.env.DB_USER || "chinook_user",
            password: process.env.DB_PASSWORD || "secure_password",
            port: parseInt(process.env.DB_PORT) || 5432,
        },
        pool: {
            min: parseInt(process.env.DB_POOL_MIN) || 5,
            max: parseInt(process.env.DB_POOL_MAX) || 20,
            acquireTimeoutMillis: 60000,
            createTimeoutMillis: 30000,
            destroyTimeoutMillis: 5000,
            idleTimeoutMillis: 30000,
            reapIntervalMillis: 1000,
            createRetryIntervalMillis: 100,
        },
        migrations: {
            tableName: "knex_migrations",
        },
        acquireConnectionTimeout: 60000,
        useNullAsDefault: true,
    },
};
