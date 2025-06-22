const fs = require('fs/promises');
const path = require('path');
const IBaseRepository = require('../IBaseRepository');

const dbPath = path.join(__dirname, 'db.json');

class JsonFileAlbumRepository extends IBaseRepository {
    constructor() {
        super();
    }

    async _readData() {
        try {
            const rawData = await fs.readFile(dbPath, 'utf-8');
            return JSON.parse(rawData);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // File doesn't exist, return initial structure
                return { albums: [] };
            }
            throw error;
        }
    }

    async _writeData(data) {
        await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    }

    async getAll() {
        const data = await this._readData();
        return data.albums || [];
    }

    async getById(id) {
        const data = await this._readData();
        const album = (data.albums || []).find(a => a.id === id);
        return album || null;
    }

    async create(entity) {
        const data = await this._readData();
        if (!data.albums) {
            data.albums = [];
        }
        // Simple ID generation (can be improved)
        const newId = data.albums.length > 0 ? Math.max(...data.albums.map(a => a.id)) + 1 : 1;
        const newAlbum = { ...entity, id: newId };
        data.albums.push(newAlbum);
        await this._writeData(data);
        return newAlbum;
    }

    async update(id, entity) {
        const data = await this._readData();
        if (!data.albums) {
            return null; // Or throw an error
        }
        const albumIndex = data.albums.findIndex(a => a.id === id);
        if (albumIndex === -1) {
            return null;
        }
        const updatedAlbum = { ...data.albums[albumIndex], ...entity, id: id }; // Ensure ID remains the same
        data.albums[albumIndex] = updatedAlbum;
        await this._writeData(data);
        return updatedAlbum;
    }

    async delete(id) {
        const data = await this._readData();
        if (!data.albums) {
            return false;
        }
        const initialLength = data.albums.length;
        data.albums = data.albums.filter(a => a.id !== id);
        if (data.albums.length < initialLength) {
            await this._writeData(data);
            return true;
        }
        return false;
    }
}

module.exports = JsonFileAlbumRepository;
