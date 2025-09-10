class TipoActivosService {
    /**
     *
     * @param { import('../../../database/repository/IBaseRepository')} repository
     */
    constructor(repository) {
        this.repository = repository
    }

    get() {
        return this.repository.getAll()
    }

    add(tiposervicio) {
        return this.repository.create(tiposervicio)
    }

    update(tiposervicio) {
        return this.repository.update(tiposervicio)
    }
}
module.exports = TipoActivosService
