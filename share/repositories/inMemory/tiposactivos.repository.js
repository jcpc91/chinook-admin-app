const IBaseRepository = require("../../../database/repository/IBaseRepository");

class TiposActivosRespository extends IBaseRepository {
    constructor() {
        super()
        this.items = []
    }

    getAll() {
        return new Promise(resolve => {
            resolve(this.items)
        })
    }

    create(item) {
        return new Promise(resolve => {
            this.items.push(item)
            resolve(item)
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
