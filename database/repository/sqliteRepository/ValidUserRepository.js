
const IValidUserRepository = require("../IValidUserRepository");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

module.exports = class UserRepository extends IValidUserRepository {
    constructor() {
        super();
        this.db = new sqlite3.Database(path.resolve(__dirname, "../../../.db/auth.sqlite3"), (err) => {
            if (err) {
                console.error("Error connecting to the SQLite database:", err.message);
            } else {
                console.log("Connected to the SQLite database.");
        }})
    }

    validUserPassword(username, password) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        })
    }

    testConnection() {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT 1 as test`, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }
}
