class ActivosService {
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
        return this.activosRepository.add(activo);
    }

    update(id, updatedActivo) {
        return this.activosRepository.update(id, updatedActivo);
    }

    delete(id) {
        return this.activosRepository.delete(id);
    }
}

module.exports = ActivosService;
