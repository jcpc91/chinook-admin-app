const IBaseRepository = require('../IBaseRepository');

/**
 * @class InMemoryAlbumRepository
 * @description Implementación del repositorio para la entidad 'Album' utilizando datos en memoria.
 * Simula las operaciones de base de datos.
 */
class InMemoryAlbumRepository extends IBaseRepository {
    constructor() {
        super();
        // Simulación de una "tabla" de base de datos en memoria
        this.albums = [
            { id: 1, title: 'In Utero', artistId: 101 },
            { id: 2, title: 'Nevermind', artistId: 101 },
            { id: 3, title: 'The Colour and the Shape', artistId: 102 },
            { id: 4, title: 'One by One', artistId: 102 }
        ];
        this.nextId = this.albums.length > 0 ? Math.max(...this.albums.map(a => a.id)) + 1 : 1;
    }

    /**
     * Obtiene todos los álbumes.
     * @returns {Promise<Array<Object>>} Promesa que resuelve con la lista de álbumes.
     */
    async getAll() {
        console.log('📖 Obteniendo todos los álbumes de la "base de datos" en memoria...');
        return Promise.resolve(this.albums);
    }

    /**
     * Obtiene un álbum por su ID.
     * @param {number} id El ID del álbum.
     * @returns {Promise<Object|null>} Promesa que resuelve con el álbum encontrado o null.
     */
    async getById(id) {
        console.log(`🔎 Buscando álbum con ID: ${id} en la "base de datos" en memoria...`);
        const album = this.albums.find(a => a.id === id);
        return Promise.resolve(album || null);
    }

    /**
     * Crea un nuevo álbum.
     * @param {Object} albumData Los datos del álbum a crear.
     * @returns {Promise<Object>} Promesa que resuelve con el álbum creado (incluyendo ID).
     */
    async create(albumData) {
        const newAlbum = { id: this.nextId++, ...albumData };
        this.albums.push(newAlbum);
        console.log('➕ Álbum creado en la "base de datos" en memoria:', newAlbum);
        return Promise.resolve(newAlbum);
    }

    /**
     * Actualiza un álbum existente.
     * @param {number} id El ID del álbum a actualizar.
     * @param {Object} albumData Los datos actualizados del álbum.
     * @returns {Promise<Object|null>} Promesa que resuelve con el álbum actualizado o null si no se encuentra.
     */
    async update(id, albumData) {
        const index = this.albums.findIndex(a => a.id === id);
        if (index > -1) {
            this.albums[index] = { ...this.albums[index], ...albumData, id: id }; // Asegura que el ID no cambie
            console.log('🔄 Álbum actualizado en la "base de datos" en memoria:', this.albums[index]);
            return Promise.resolve(this.albums[index]);
        }
        console.log(`❌ Álbum con ID: ${id} no encontrado para actualizar.`);
        return Promise.resolve(null);
    }

    /**
     * Elimina un álbum por su ID.
     * @param {number} id El ID del álbum a eliminar.
     * @returns {Promise<boolean>} Promesa que resuelve con true si se eliminó, false en caso contrario.
     */
    async delete(id) {
        const initialLength = this.albums.length;
        this.albums = this.albums.filter(a => a.id !== id);
        if (this.albums.length < initialLength) {
            console.log(`🗑️ Álbum con ID: ${id} eliminado de la "base de datos" en memoria.`);
            return Promise.resolve(true);
        }
        console.log(`❌ Álbum con ID: ${id} no encontrado para eliminar.`);
        return Promise.resolve(false);
    }
}

module.exports = InMemoryAlbumRepository;