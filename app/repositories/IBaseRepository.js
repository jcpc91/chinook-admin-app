// interfaces/IBaseRepository.js
/**
 * @class IBaseRepository
 * @description Define la interfaz base para las operaciones CRUD.
 * Esta clase actúa como una interfaz abstracta que debe ser implementada
 * por los repositorios concretos.
 */
class IBaseRepository {
    /**
     * Obtiene todos los registros.
     * @returns {Promise<Array<Object>>} Una promesa que resuelve con un array de objetos.
     */
    async getAll() {
        throw new Error('El método getAll() debe ser implementado por la subclase.');
    }

    /**
     * Obtiene un registro por su ID.
     * @param {number|string} id El ID del registro a obtener.
     * @returns {Promise<Object|null>} Una promesa que resuelve con el objeto encontrado o null.
     */
    async getById(id) {
        throw new Error('El método getById(id) debe ser implementado por la subclase.');
    }

    /**
     * Crea un nuevo registro.
     * @param {Object} entity El objeto a crear.
     * @returns {Promise<Object>} Una promesa que resuelve con el objeto creado.
     */
    async create(entity) {
        throw new Error('El método create(entity) debe ser implementado por la subclase.');
    }

    /**
     * Actualiza un registro existente.
     * @param {number|string} id El ID del registro a actualizar.
     * @param {Object} entity El objeto con los datos actualizados.
     * @returns {Promise<Object|null>} Una promesa que resuelve con el objeto actualizado o null si no se encuentra.
     */
    async update(id, entity) {
        throw new Error('El método update(id, entity) debe ser implementado por la subclase.');
    }

    /**
     * Elimina un registro por su ID.
     * @param {number|string} id El ID del registro a eliminar.
     * @returns {Promise<boolean>} Una promesa que resuelve con true si se eliminó, false en caso contrario.
     */
    async delete(id) {
        throw new Error('El método delete(id) debe ser implementado por la subclase.');
    }
}

module.exports = IBaseRepository;