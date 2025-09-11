const IBaseRepository = require("../../../database/repository/IBaseRepository");
const {Database} = require('sqlite3').verbose()
const path = require("path");

class ActivosRepository extends IBaseRepository {
    constructor() {
        super();
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

    async getAll() {
        return new Promise((resolve, reject) => {
            this.db.all('select * from activos', (err, rows) => {
                if (err)
                    reject(err)
                resolve(rows)
            })
        });
    }

    get(id) {
        return this.activos.find((activo) => activo.id === id);
    }

    async create(entity) {
        return new Promise((resolve, reject) => {
            //{ ticker: "AAPL", nombre: "Apple Inc.", tipo: "Acciones", valormercado: 150.75 }
            const sql = `INSERT INTO activos (ticker, nombre, tipo, valormercado) VALUES (?,?,?,?);`
            const values = [entity.ticker, entity.nombre, entity.tipo, entity.valormercado]

            this.db.run(sql, values, (err) => {
                if (err) reject(err);
                resolve(this)

            })
        });
    }

    update(id, updatedActivo) {
        const activoIndex = this.activos.findIndex((activo) => activo.id === id);
        if (activoIndex === -1) {
            return null;
        }
        this.activos[activoIndex] = { ...this.activos[activoIndex], ...updatedActivo };
        return this.activos[activoIndex];
    }

    delete(id) {
        const activoIndex = this.activos.findIndex((activo) => activo.id === id);
        if (activoIndex === -1) {
            return false;
        }
        this.activos.splice(activoIndex, 1);
        return true;
    }
}

module.exports = ActivosRepository;
