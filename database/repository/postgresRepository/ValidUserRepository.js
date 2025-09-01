const IValidUserRepository = require("../IValidUserRepository");
const knex = require("knex");
const path = require("path");

module.exports = class ValidUserRepository extends IValidUserRepository {
    constructor() {
        super();

        // Load knex configuration based on environment
        const environment = process.env.NODE_ENV || 'development';
        const knexConfig = require(path.resolve(__dirname, "../../auth/knexfile.js"));

        this.db = knex(knexConfig[environment]);

        // Test database connection
        this.db.raw('SELECT 1')
            .then(() => {
                console.log(`Connected to PostgreSQL database (${environment})`);
            })
            .catch((err) => {
                console.error("Error connecting to PostgreSQL database:", err.message);
            });
    }

    async validUserPassword(username, password) {
        try {
            const user = await this.db('users')
                .where({ username, password })
                .first();

            return user || null;
        } catch (error) {
            console.error("Database query error:", error);
            throw error;
        }
    }

    async testConnection() {
        try {
            const result = await this.db.raw('SELECT 1 as test');
            return result.rows ? result.rows[0] : result[0];
        } catch (error) {
            console.error("Database connection test error:", error);
            throw error;
        }
    }

    // Graceful shutdown method
    async close() {
        if (this.db) {
            await this.db.destroy();
            console.log("PostgreSQL connection closed");
        }
    }
}
