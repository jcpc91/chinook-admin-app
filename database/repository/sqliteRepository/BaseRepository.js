const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const IBaseRepository = require("../IBaseRepository");

class BaseRepository extends IBaseRepository {
    constructor(tableName, dbPath = path.resolve(__dirname, "../../../.db/dev.sqlite3")) {
        super();
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error(
                    `(${tableName}) Error al conectar a la base de datos SQLite (${dbPath})`,
                    err.message,
                );
            } else {
                console.log(`Conectado a la base de datos SQLite. (${dbPath})`);
            }
        });
        this.tableName = tableName;
    }

    async getAll() {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM ${this.tableName}`, [], (err, rows) => {
                if (err) {
                    reject(err);
                }
                resolve(rows);
            });
        });
    }

    async getById(id) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id], (err, row) => {
                if (err) {
                    reject(err);
                }
                resolve(row);
            });
        });
    }

    /**
     * Inserts a new record into the database table associated with this repository.
     * @param {Object} entity - The object to create in the database, where each key is a column name.
     * @returns {Promise<Object>} A promise that resolves with the created object, including the generated ID.
     */
    async create(entity) {
        return new Promise((resolve, reject) => {
            const keys = Object.keys(entity);
            const values = Object.values(entity);
            const placeholders = keys.map(() => "?").join(", ");

            const sql = `INSERT INTO ${this.tableName} (${keys.join(", ")}) VALUES (${placeholders})`;

            this.db.run(sql, values, function (err) {
                if (err) {
                    reject(err);
                }
                resolve({ id: this.lastID, ...entity });
            });
        });
    }

    async update(id, entity) {
        return new Promise((resolve, reject) => {
            const keys = Object.keys(entity);
            const values = Object.values(entity);
            const setClause = keys.map((key) => `${key} = ?`).join(", ");

            const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;

            this.db.run(sql, [...values, id], function (err) {
                if (err) {
                    reject(err);
                }
                resolve({ id, ...entity });
            });
        });
    }

    async delete(id) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;

            this.db.run(sql, [id], function (err) {
                if (err) {
                    reject(err);
                }
                resolve(this.changes > 0);
            });
        });
    }
}

module.exports = BaseRepository;
