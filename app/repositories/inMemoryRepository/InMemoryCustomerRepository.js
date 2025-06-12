// repositories/InMemoryCustomerRepository.js
const IBaseRepository = require('../IBaseRepository');

/**
 * @class InMemoryCustomerRepository
 * @description Implementación del repositorio para la entidad 'Customer' utilizando datos en memoria.
 * Simula las operaciones de base de datos.
 */
class InMemoryCustomerRepository extends IBaseRepository {
    constructor() {
        super();
        this.customers = [
            { id: 201, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
            { id: 202, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com' }
        ];
        this.nextId = this.customers.length > 0 ? Math.max(...this.customers.map(c => c.id)) + 1 : 1;
    }

    async getAll() {
        console.log('📖 Obteniendo todos los clientes de la "base de datos" en memoria...');
        return Promise.resolve(this.customers);
    }

    async getById(id) {
        console.log(`🔎 Buscando cliente con ID: ${id} en la "base de datos" en memoria...`);
        const customer = this.customers.find(c => c.id === id);
        return Promise.resolve(customer || null);
    }

    async create(customerData) {
        const newCustomer = { id: this.nextId++, ...customerData };
        this.customers.push(newCustomer);
        console.log('➕ Cliente creado en la "base de datos" en memoria:', newCustomer);
        return Promise.resolve(newCustomer);
    }

    async update(id, customerData) {
        const index = this.customers.findIndex(c => c.id === id);
        if (index > -1) {
            this.customers[index] = { ...this.customers[index], ...customerData, id: id };
            console.log('🔄 Cliente actualizado en la "base de datos" en memoria:', this.customers[index]);
            return Promise.resolve(this.customers[index]);
        }
        console.log(`❌ Cliente con ID: ${id} no encontrado para actualizar.`);
        return Promise.resolve(null);
    }

    async delete(id) {
        const initialLength = this.customers.length;
        this.customers = this.customers.filter(c => c.id !== id);
        if (this.customers.length < initialLength) {
            console.log(`🗑️ Cliente con ID: ${id} eliminado de la "base de datos" en memoria.`);
            return Promise.resolve(true);
        }
        console.log(`❌ Cliente con ID: ${id} no encontrado para eliminar.`);
        return Promise.resolve(false);
    }
}

module.exports = InMemoryCustomerRepository;