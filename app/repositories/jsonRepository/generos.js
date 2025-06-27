const fs = require('fs/promises');
const path = require('path');
const IBaseRepository = require('../IBaseRepository');

const dbPath = path.join(__dirname, 'db.json');

class JsonFileGenreRepository extends IBaseRepository {
    async _readData() {
            try {
                const rawData = await fs.readFile(dbPath, 'utf-8');
                return JSON.parse(rawData);
            } catch (error) {
                if (error.code === 'ENOENT') {
                    // File doesn't exist, return initial structure
                    return { generos: [] };
                }
                throw error;
            }
        }
    
    async _writeData(data) {
        await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    }

    async getAll() {
        const data = await this._readData();
        return data.generos || [];
    }

    async getById(id) {
        const data = await this._readData();
        const t = (data.generos || []).find(a => a.id == id);
        return t || null;
    }

    async create(entity) {
        const data = await this._readData();
        if (!data.generos) {
            data.generos = [];
        }
        // Simple ID generation (can be improved)
        const newId = data.generos.length > 0 ? Math.max(...data.generos.map(a => a.id)) + 1 : 1;
        const newT = { ...entity, id: newId };
        data.generos.push(newT);
        await this._writeData(data);
        return newT;
    }

    async update(id, entity) {
        const data = await this._readData();
        if (!data.generos) {
            return null; // Or throw an error
        }
        const index = data.generos.findIndex(a => a.id == id);
        if (index === -1) {
            return null;
        }
        const updatedT = { ...data.generos[index], ...entity, id: id }; // Ensure ID remains the same
        data.generos[index] = updatedT;
        await this._writeData(data);
        return updatedT;
    }

    async delete(id) {
        const data = await this._readData();
        if (!data.generos) {
            return false;
        }
        const initialLength = data.generos.length;
        data.generos = data.generos.filter(a => a.id != id);
        if (data.generos.length < initialLength) {
            await this._writeData(data);
            return true;
        }
        return false;
    }
}

module.exports = JsonFileGenreRepository;