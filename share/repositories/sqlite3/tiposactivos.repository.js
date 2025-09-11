const IBaseRepository = require("../../../database/repository/IBaseRepository");
const {Database} = require('sqlite3').verbose()
const path = require("path");

class TiposActivosRespository extends IBaseRepository {
    constructor() {
        super()
        const dbPath = path.resolve(__dirname, '../../../.db/inversiones.sqlite3')
        this.db = new Database(dbPath, err => {
            if (err) {
                console.error(
                    `(activos) Error al conectar a la base de datos SQLite (${dbPath})`,
                    err.message,
                );
            } else {
                console.log(`Conectado a la base de datos SQLite. (${dbPath})`);
            }
        })
    }

    getAll() {
        return new Promise((resolve, reject) => {
            this.db.all('select * from tiposactivos', (err, rows) => {
                if (err)
                    reject(err)
                resolve(rows)
            })
        })
    }

    create(item) {
        return new Promise(resolve => {
            const sql = `INSERT INTO tiposactivos (codigo, categoria, subcategoria, nivelriesgo, horizonteinversion, liquidez)
VALUES (?, ?, ?, ?, ?, ?);`;
            const values = [item.codigo, item.categoria, item.subcategoria, item.nivelriesgo, item.horizonteinversion, item.liquidez]
            this.db.run(sql, values, (err) => {

                if (err) reject(err);

                resolve(this)

            })
        })
    }

    update(item) {
        return new Promise(resolve => {
            const index = this.items.findIndex((i) => i.codigo == item.codigo)
            if (index !== -1)
                this.items[index] = item
            resolve()
        })
    }
}
module.exports = TiposActivosRespository
