class MediaTypeService {
    /**
     * Constructor de la clase MediaTypeService.
     * @param {import('../IBaseRepository')} mediaTypeRepository El repositorio de MediaTypes.
     */
    constructor(mediaTypeRepository) {
        this.mediaTypeRepository = mediaTypeRepository;
    }
    async getMediaTypes() {
        console.log('👉 Servicio de MediaTypes: Solicitando todos los MediaTypes.');
        return this.mediaTypeRepository.getAll();
    }
    async getMediaTypeById(id) {
        console.log(`👉 Servicio de MediaTypes: Solicitando MediaType con ID: ${id}.`);
        return this.mediaTypeRepository.getById(id);
    }
    async createMediaType(mediaTypeData) {
        console.log('👉 Servicio de MediaTypes: Creando nuevo MediaType.');
        return this.mediaTypeRepository.create(mediaTypeData);
    }
    async updateMediaType(id, mediaTypeData) {
        console.log(`👉 Servicio de MediaTypes: Actualizando MediaType con ID: ${id}.`);
        return this.mediaTypeRepository.update(id, mediaTypeData);
    }
    async deleteMediaType(id) {
        console.log(`👉 Servicio de MediaTypes: Eliminando MediaType con ID: ${id}.`);
        return this.mediaTypeRepository.delete(id);
    }
}

module.exports = MediaTypeService;