const knex = require("knex");
const path = require("path");
const IBaseRepository = require("../IBaseRepository");

class BaseRepository extends IBaseRepository {
    constructor(tableName, knexConfigPath = "../../app/knexfile.js") {
        super();
        this.tableName = tableName;

        // Load knex configuration based on environment
        const environment = process.env.NODE_ENV || 'development';
        const knexConfig = require(path.resolve(__dirname, knexConfigPath));

        this.db = knex(knexConfig[environment]);

        // Test database connection
        this.db.raw('SELECT 1')
            .then(() => {
                console.log(`Connected to PostgreSQL database (${environment}) for table: ${tableName}`);
            })
            .catch((err) => {
                console.error(`Error connecting to PostgreSQL database for table ${tableName}:`, err.message);
            });
    }

    async getAll() {
        try {
            return await this.db(this.tableName).select('*');
        } catch (error) {
            console.error(`Error fetching all records from ${this.tableName}:`, error);
            throw error;
        }
    }

    async getById(id) {
        try {
            return await this.db(this.tableName)
                .where('id', id)
                .first();
        } catch (error) {
            console.error(`Error fetching record by id ${id} from ${this.tableName}:`, error);
            throw error;
        }
    }

    async create(entity) {
        try {
            const [result] = await this.db(this.tableName)
                .insert(entity)
                .returning('*');
            return result;
        } catch (error) {
            console.error(`Error creating record in ${this.tableName}:`, error);
            throw error;
        }
    }

    async update(id, entity) {
        try {
            const [result] = await this.db(this.tableName)
                .where('id', id)
                .update(entity)
                .returning('*');
            return result;
        } catch (error) {
            console.error(`Error updating record ${id} in ${this.tableName}:`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const deletedCount = await this.db(this.tableName)
                .where('id', id)
                .del();
            return deletedCount > 0;
        } catch (error) {
            console.error(`Error deleting record ${id} from ${this.tableName}:`, error);
            throw error;
        }
    }

    // Graceful shutdown method
    async close() {
        if (this.db) {
            await this.db.destroy();
            console.log(`PostgreSQL connection closed for ${this.tableName}`);
        }
    }
}

module.exports = BaseRepository;
