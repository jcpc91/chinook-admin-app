const IRegisterRepository = require('../IRegisterRepository');
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

class RegisterRepository extends IRegisterRepository {
    constructor() {
        super()
        // this.db = new sqlite3.Database(path.resolve(__dirname, "../../../.db/auth.sqlite3"), (err) => {
        //     if (err) {
        //         console.error("Error connecting to the SQLite database:", err.message);
        //     } else {
        //         console.log("Connected to the SQLite database.");
        //     }
        // });
    }
}

module.exports = RegisterRepository
