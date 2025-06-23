const fs = require('fs/promises');
const path = require('path');
const IBaseRepository = require('../IBaseRepository');

const dbPath = path.join(__dirname, 'db.json');

class JsonFileMediaTypeRepository extends IBaseRepository {
    async _readData() {
        try {
            const rawData = await fs.readFile(dbPath, 'utf-8');
            return JSON.parse(rawData);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // File doesn't exist, return initial structure
                return { mediatypes: [] };
            }
            throw error;
        }
    }

    async _writeData(data) {
        await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    }

    async getAll() {
        const data = await this._readData();
        return data.mediatypes || [];
    }

    async getById(id) {
        const data = await this._readData();
        const album = (data.mediatypes || []).find(a => a.id === id);
        return album || null;
    }

    async create(entity) {
        const data = await this._readData();
        if (!data.mediatypes) {
            data.mediatypes = [];
        }
        // Simple ID generation (can be improved)
        const newId = data.mediatypes.length > 0 ? Math.max(...data.mediatypes.map(a => a.id)) + 1 : 1;
        const newAlbum = { ...entity, id: newId };
        data.mediatypes.push(newAlbum);
        await this._writeData(data);
        return newAlbum;
    }

    async update(id, entity) {
        const data = await this._readData();
        if (!data.mediatypes) {
            return null; // Or throw an error
        }
        const albumIndex = data.mediatypes.findIndex(a => a.id === id);
        if (albumIndex === -1) {
            return null;
        }
        const updatedAlbum = { ...data.mediatypes[albumIndex], ...entity, id: id }; // Ensure ID remains the same
        data.mediatypes[albumIndex] = updatedAlbum;
        await this._writeData(data);
        return updatedAlbum;
    }

    async delete(id) {
        const data = await this._readData();
        if (!data.mediatypes) {
            return false;
        }
        const initialLength = data.mediatypes.length;
        data.mediatypes = data.mediatypes.filter(a => a.id !== id);
        if (data.mediatypes.length < initialLength) {
            await this._writeData(data);
            return true;
        }
        return false;
    }
}

module.exports = JsonFileMediaTypeRepository;