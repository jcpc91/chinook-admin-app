// repositories/InMemoryArtistRepository.js
const IBaseRepository = require('../IBaseRepository');

/**
 * @class InMemoryArtistRepository
 * @description Implementación del repositorio para la entidad 'Artist' utilizando datos en memoria.
 * Simula las operaciones de base de datos.
 */
class InMemoryArtistRepository extends IBaseRepository {
    constructor() {
        super();
        this.artists = [
            { id: 101, name: 'Nirvana' },
            { id: 102, name: 'Foo Fighters' },
            { id: 103, name: 'Queen' }
        ];
        this.nextId = this.artists.length > 0 ? Math.max(...this.artists.map(a => a.id)) + 1 : 1;
    }

    async getAll() {
        console.log('📖 Obteniendo todos los artistas de la "base de datos" en memoria...');
        return Promise.resolve(this.artists);
    }

    async getById(id) {
        console.log(`🔎 Buscando artista con ID: ${id} en la "base de datos" en memoria...`);
        const artist = this.artists.find(a => a.id === id);
        return Promise.resolve(artist || null);
    }

    async create(artistData) {
        const newArtist = { id: this.nextId++, ...artistData };
        this.artists.push(newArtist);
        console.log('➕ Artista creado en la "base de datos" en memoria:', newArtist);
        return Promise.resolve(newArtist);
    }

    async update(id, artistData) {
        const index = this.artists.findIndex(a => a.id === id);
        if (index > -1) {
            this.artists[index] = { ...this.artists[index], ...artistData, id: id };
            console.log('🔄 Artista actualizado en la "base de datos" en memoria:', this.artists[index]);
            return Promise.resolve(this.artists[index]);
        }
        console.log(`❌ Artista con ID: ${id} no encontrado para actualizar.`);
        return Promise.resolve(null);
    }

    async delete(id) {
        const initialLength = this.artists.length;
        this.artists = this.artists.filter(a => a.id !== id);
        if (this.artists.length < initialLength) {
            console.log(`🗑️ Artista con ID: ${id} eliminado de la "base de datos" en memoria.`);
            return Promise.resolve(true);
        }
        console.log(`❌ Artista con ID: ${id} no encontrado para eliminar.`);
        return Promise.resolve(false);
    }
}

module.exports = InMemoryArtistRepository;