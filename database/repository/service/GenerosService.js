class GenerosService {
    /**
     * @param {import('../IBaseRepository')} generoRepository Una instancia de un repositorio de artistas.
     */
    constructor(generoRepository) {
        this.generoRepository = generoRepository;
    }
    async getGeneros() {
        console.log('👉 Servicio de Generos: Solicitando todos los generos.');
        return this.generoRepository.getAll();
    }
    async getGenerosById(id) {
        console.log(`👉 Servicio de Generos: Solicitando genero con ID: ${id}.`);
        return this.generoRepository.getById(id);
    }

    async createGenero(generoData) {
        console.log('👉 Servicio de Generos: Creando nuevo genero.');
        return this.generoRepository.create(generoData);
    }

    async updateGenero(id, generoData) {
        console.log(`👉 Servicio de Generos: Actualizando genero con ID: ${id}.`);
        return this.generoRepository.update(id, generoData);
    }

    async deleteGenero(id) {
        console.log(`👉 Servicio de Generos: Eliminando genero con ID: ${id}.`);
        return this.generoRepository.delete(id);
    }
}

module.exports = GenerosService;