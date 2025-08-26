const IBaseRepository = require("../../../database/repository/IBaseRepository");

class ActivosRepository extends IBaseRepository {
    constructor() {
        super();
        this.activos = [
            { ticker: "AAPL", nombre: "Apple Inc.", tipo: "Acciones", valormercado: 150.75 },
            { ticker: "MSFT", nombre: "Microsoft Corporation", tipo: "Acciones", valormercado: 250.25 },
            { ticker: "GOOGL", nombre: "Alphabet Inc.", tipo: "Acciones", valormercado: 120.50 },
        ];
    }

    async getAll() {
        return new Promise((resolve) => {
            resolve(this.activos);
        });
    }

    get(id) {
        return this.activos.find((activo) => activo.id === id);
    }

    async add(activo) {
        return new Promise((resolve) => {
            this.activos.push(activo);
            resolve(activo);
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
