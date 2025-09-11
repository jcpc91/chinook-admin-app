class ActivosService {
    /**
     * @param {import('../../../database/repository/IBaseRepository')} activosRepository
     * @property {import('../../../database/repository/IBaseRepository')} activosRepository
     */
    constructor(activosRepository) {
        this.activosRepository = activosRepository;
    }

    getAll() {
        return this.activosRepository.getAll();
    }

    get(id) {
        return this.activosRepository.get(id);
    }

    add(activo) {
        return this.activosRepository.create(activo);
    }

    update(id, updatedActivo) {
        return this.activosRepository.update(id, updatedActivo);
    }

    delete(id) {
        return this.activosRepository.delete(id);
    }
}

module.exports = ActivosService;
