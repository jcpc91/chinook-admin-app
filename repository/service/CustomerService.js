// services/CustomerService.js
/**
 * @class CustomerService
 * @description Proporciona la lógica de negocio relacionada con los clientes.
 * Depende de una implementación de IBaseRepository para el acceso a datos,
 * mostrando la Inyección de Dependencias.
 */
class CustomerService {
    /**
     * @param {IBaseRepository} customerRepository Una instancia de un repositorio de clientes.
     */
    constructor(customerRepository) {
        this.customerRepository = customerRepository;
    }

    /**
     * Obtiene todos los clientes.
     * @returns {Promise<Array<Object>>} Promesa que resuelve con la lista de clientes.
     */
    async getCustomers() {
        console.log('👉 Servicio de Clientes: Solicitando todos los clientes.');
        return this.customerRepository.getAll();
    }

    /**
     * Obtiene un cliente por su ID.
     * @param {number} id El ID del cliente.
     * @returns {Promise<Object|null>} Promesa que resuelve con el cliente o null.
     */
    async getCustomerById(id) {
        console.log(`👉 Servicio de Clientes: Solicitando cliente con ID: ${id}.`);
        return this.customerRepository.getById(id);
    }

    /**
     * Crea un nuevo cliente.
     * @param {Object} customerData Los datos del cliente a crear.
     * @returns {Promise<Object>} Promesa que resuelve con el cliente creado.
     */
    async createCustomer(customerData) {
        console.log('👉 Servicio de Clientes: Creando nuevo cliente.');
        return this.customerRepository.create(customerData);
    }

    /**
     * Actualiza un cliente existente.
     * @param {number} id El ID del cliente a actualizar.
     * @param {Object} customerData Los datos actualizados del cliente.
     * @returns {Promise<Object|null>} Promesa que resuelve con el cliente actualizado o null.
     */
    async updateCustomer(id, customerData) {
        console.log(`👉 Servicio de Clientes: Actualizando cliente con ID: ${id}.`);
        return this.customerRepository.update(id, customerData);
    }

    /**
     * Elimina un cliente.
     * @param {number} id El ID del cliente a eliminar.
     * @returns {Promise<boolean>} Promesa que resuelve con true si se eliminó, false en caso contrario.
     */
    async deleteCustomer(id) {
        console.log(`👉 Servicio de Clientes: Eliminando cliente con ID: ${id}.`);
        return this.customerRepository.delete(id);
    }
}

module.exports = CustomerService;