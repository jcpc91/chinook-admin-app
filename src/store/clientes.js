import { defineStore } from 'pinia';

// TODO: Replace with actual API calls
const apiClient = {
  get: (url) => new Promise((resolve) => {
    console.log(`API GET request to ${url}`);
    setTimeout(() => {
      if (url.includes('/customers/')) { // e.g. /customers/1
        const id = parseInt(url.split('/').pop());
        // Simulate finding a customer or returning undefined
        const customer = useClientesStore().customers.find(c => c.CustomerId === id);
        resolve({ data: customer });
      } else { // e.g. /customers
        // In a real scenario, this would fetch all customers
        // For now, return the current state or an empty array if not yet populated
        resolve({ data: useClientesStore().customers || [] });
      }
    }, 500);
  }),
  post: (url, data) => new Promise((resolve) => {
    console.log(`API POST request to ${url} with data:`, data);
    setTimeout(() => {
      // Simulate creating a new customer and returning it with an ID
      const newCustomer = { ...data, CustomerId: Math.floor(Math.random() * 1000) + 1 };
      resolve({ data: newCustomer });
    }, 500);
  }),
  put: (url, data) => new Promise((resolve) => {
    console.log(`API PUT request to ${url} with data:`, data);
    setTimeout(() => {
      // Simulate updating a customer
      resolve({ data: { ...data } });
    }, 500);
  }),
  delete: (url) => new Promise((resolve) => {
    console.log(`API DELETE request to ${url}`);
    setTimeout(() => {
      // Simulate successful deletion
      resolve({ data: {} });
    }, 500);
  }),
};

export const useClientesStore = defineStore('clientes', {
  state: () => ({
    customers: [], // Will hold the list of customers
    currentCustomer: null, // Will hold the customer being edited or viewed
  }),
  getters: {
    getAllCustomers: (state) => state.customers,
    getCustomerById: (state) => (id) => state.customers.find(c => c.CustomerId == id),
  },
  actions: {
    async fetchCustomers() {
      try {
        
        return new Promise((resolve) => {
          setTimeout(() => {
            const c = [
              // Example Customer Data - Add more as needed
              { CustomerId: 1, FirstName: "Maria", LastName: "Anders", Company: "Alfreds Futterkiste", Address: "Obere Str. 57", City: "Berlin", State: null, Country: "Germany", PostalCode: "12209", Phone: "030-0074321", Fax: "030-0076545", Email: "maria.anders@example.com", SupportRepId: 2 },
              { CustomerId: 2, FirstName: "Ana", LastName: "Trujillo", Company: "Ana Trujillo Emparedados y helados", Address: "Avda. de la Constitución 2222", City: "México D.F.", State: null, Country: "Mexico", PostalCode: "05021", Phone: "(5) 555-4729", Fax: "(5) 555-3745", Email: "ana.trujillo@example.com", SupportRepId: 2 },
              { CustomerId: 3, FirstName: "Antonio", LastName: "Moreno", Company: "Antonio Moreno Taquería", Address: "Mataderos 2312", City: "México D.F.", State: null, Country: "Mexico", PostalCode: "05023", Phone: "(5) 555-3932", Fax: null, Email: "antonio.moreno@example.com", SupportRepId: 1 }
            ];
            this.customers = [...c];
            console.log('Customers fetched:', this.customers);
            resolve(this.customers);
          }, 1000); // Simulate network delay
        });
      } catch (error) {
        console.error('Error fetching customers:', error);
        // Handle error appropriately
      }
    },
    async fetchCustomer(id) {
      try {
        // const response = await apiClient.get(`/customers/${id}`);
        // this.currentCustomer = response.data;
        // return response.data;
        console.log(`Fetching customer with id ${id}...`);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const customer = this.customers.find(c => c.CustomerId === id);
                if (customer) {
                    this.currentCustomer = {...customer};
                    console.log('Customer fetched:', this.currentCustomer);
                    resolve(this.currentCustomer);
                } else {
                    console.error('Customer not found with id:', id);
                    reject(new Error('Customer not found'));
                }
            }, 500);
        });
      } catch (error) {
        console.error(`Error fetching customer with id ${id}:`, error);
        // Handle error appropriately
      }
    },
    async createCustomer(customerData) {
      try {
        // const response = await apiClient.post('/customers', customerData);
        // this.customers.push(response.data);
        // return response.data;
        console.log('Creating customer...', customerData);
        return new Promise((resolve) => {
            setTimeout(() => {
                const newCustomer = {
                    ...customerData,
                    CustomerId: this.customers.length > 0 ? Math.max(...this.customers.map(c => c.CustomerId)) + 1 : 1
                };
                this.customers.push(newCustomer);
                console.log('Customer created:', newCustomer);
                resolve(newCustomer);
            }, 500);
        });
      } catch (error) {
        console.error('Error creating customer:', error);
        // Handle error appropriately
      }
    },
    async updateCustomer(customerData) {
      try {
        // const response = await apiClient.put(`/customers/${customerData.CustomerId}`, customerData);
        // const index = this.customers.findIndex(c => c.CustomerId === customerData.CustomerId);
        // if (index !== -1) {
        //   this.customers[index] = response.data;
        // }
        // return response.data;
        console.log('Updating customer...', customerData);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = this.customers.findIndex(c => c.CustomerId === customerData.CustomerId);
                if (index !== -1) {
                    this.customers[index] = { ...this.customers[index], ...customerData };
                    console.log('Customer updated:', this.customers[index]);
                    resolve(this.customers[index]);
                } else {
                    console.error('Customer not found for update with id:', customerData.CustomerId);
                    reject(new Error('Customer not found for update'));
                }
            }, 500);
        });
      } catch (error) {
        console.error('Error updating customer:', error);
        // Handle error appropriately
      }
    },
    async deleteCustomer(customerId) {
      try {
        // await apiClient.delete(`/customers/${customerId}`);
        // this.customers = this.customers.filter(c => c.CustomerId !== customerId);
        console.log(`Deleting customer with id ${customerId}...`);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const initialLength = this.customers.length;
                this.customers = this.customers.filter(c => c.CustomerId !== customerId);
                if (this.customers.length < initialLength) {
                    console.log('Customer deleted with id:', customerId);
                    resolve();
                } else {
                    console.error('Customer not found for deletion with id:', customerId);
                    reject(new Error('Customer not found for deletion'));
                }
            }, 500);
        });
      } catch (error) {
        console.error('Error deleting customer:', error);
        // Handle error appropriately
      }
    },
    // Action to set the current customer, useful for editing
    setCurrentCustomer(customer) {
        this.currentCustomer = customer ? {...customer} : null;
    }
  },
});
