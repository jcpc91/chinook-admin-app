// services/AlbumService.js
/**
 * @class AlbumService
 * @description Proporciona la lógica de negocio relacionada con los álbumes.
 * Depende de una implementación de IBaseRepository para el acceso a datos,
 * mostrando la Inyección de Dependencias.
 */
class AlbumService {

    constructor(albumRepository) {
        this.albumRepository = albumRepository;
    }

    /**
     * Obtiene todos los álbumes.
     * @returns {Promise<Array<Object>>} Promesa que resuelve con la lista de álbumes.
     */
    async getAlbums() {
        console.log('👉 Servicio de Álbumes: Solicitando todos los álbumes.');
        return this.albumRepository.getAll();
    }

    /**
     * Obtiene un álbum por su ID.
     * @param {number} id El ID del álbum.
     * @returns {Promise<Object|null>} Promesa que resuelve con el álbum o null.
     */
    async getAlbumById(id) {
        console.log(`👉 Servicio de Álbumes: Solicitando álbum con ID: ${id}.`);
        return this.albumRepository.getById(id);
    }

    async getAlbumByArtistId(artistId) {
        console.log(`👉 Servicio de Álbumes: Solicitando álbumes con artistid: ${artistId}.`);
        return this.albumRepository.getAlbumsByArtistId(artistId);
    }

    /**
     * Crea un nuevo álbum.
     * @param {Object} albumData Los datos del álbum a crear.
     * @returns {Promise<Object>} Promesa que resuelve con el álbum creado.
     */
    async createAlbum(albumData) {
        console.log('👉 Servicio de Álbumes: Creando nuevo álbum.');
        return this.albumRepository.create(albumData);
    }

    /**
     * Actualiza un álbum existente.
     * @param {number} id El ID del álbum a actualizar.
     * @param {Object} albumData Los datos actualizados del álbum.
     * @returns {Promise<Object|null>} Promesa que resuelve con el álbum actualizado o null.
     */
    async updateAlbum(id, albumData) {
        console.log(`👉 Servicio de Álbumes: Actualizando álbum con ID: ${id}.`);
        return this.albumRepository.update(id, albumData);
    }

    /**
     * Elimina un álbum.
     * @param {number} id El ID del álbum a eliminar.
     * @returns {Promise<boolean>} Promesa que resuelve con true si se eliminó, false en caso contrario.
     */
    async deleteAlbum(id) {
        console.log(`👉 Servicio de Álbumes: Eliminando álbum con ID: ${id}.`);
        return this.albumRepository.delete(id);
    }
}

module.exports = AlbumService;
