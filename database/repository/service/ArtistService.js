// services/ArtistService.js
/**
 * @class ArtistService
 * @description Proporciona la lógica de negocio relacionada con los artistas.
 * Depende de una implementación de IBaseRepository para el acceso a datos,
 * mostrando la Inyección de Dependencias.
 */
class ArtistService {
    /**
     * @param {import('../IBaseRepository')} artistRepository Una instancia de un repositorio de artistas.
     */
    constructor(artistRepository) {
        this.artistRepository = artistRepository;
    }

    /**
     * Obtiene todos los artistas.
     * @returns {Promise<Array<Object>>} Promesa que resuelve con la lista de artistas.
     */
    async getArtists() {
        console.log('👉 Servicio de Artistas: Solicitando todos los artistas.');
        return this.artistRepository.getAll();
    }

    /**
     * Obtiene un artista por su ID.
     * @param {number} id El ID del artista.
     * @returns {Promise<Object|null>} Promesa que resuelve con el artista o null.
     */
    async getArtistById(id) {
        console.log(`👉 Servicio de Artistas: Solicitando artista con ID: ${id}.`);
        return this.artistRepository.getById(id);
    }

    /**
     * Crea un nuevo artista.
     * @param {Object} artistData Los datos del artista a crear.
     * @returns {Promise<Object>} Promesa que resuelve con el artista creado.
     */
    async createArtist(artistData) {
        console.log('👉 Servicio de Artistas: Creando nuevo artista.');
        return this.artistRepository.create(artistData);
    }

    /**
     * Actualiza un artista existente.
     * @param {number} id El ID del artista a actualizar.
     * @param {Object} artistData Los datos actualizados del artista.
     * @returns {Promise<Object|null>} Promesa que resuelve con el artista actualizado o null.
     */
    async updateArtist(id, artistData) {
        console.log(`👉 Servicio de Artistas: Actualizando artista con ID: ${id}.`);
        return this.artistRepository.update(id, artistData);
    }

    /**
     * Elimina un artista.
     * @param {number} id El ID del artista a eliminar.
     * @returns {Promise<boolean>} Promesa que resuelve con true si se eliminó, false en caso contrario.
     */
    async deleteArtist(id) {
        console.log(`👉 Servicio de Artistas: Eliminando artista con ID: ${id}.`);
        return this.artistRepository.delete(id);
    }
}

module.exports = ArtistService;