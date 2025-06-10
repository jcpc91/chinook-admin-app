import { defineStore } from 'pinia';

export const useEmpleadosStore = defineStore('empleados', {
  state: () => ({
    empleados: [],
  }),
  getters: {
    getEmpleados: (state) => state.empleados,
    getEmpleadoById: (state) => (id) => state.empleados.find(emp => emp.EmployeeId == id),
  },
  actions: {
    fetchEmpleados() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const e = [
            { EmployeeId: 1, LastName: "Davolio", FirstName: "Nancy", Title: "Sales Representative", ReportsTo: 2, BirthDate: "1948-12-08", HireDate: "1992-05-01", Address: "507 - 20th Ave. E.\nApt. 2A", City: "Seattle", State: "WA", Country: "USA", PostalCode: "98122", Phone: "(206) 555-9857", Fax: null, Email: "nancy@northwindtraders.com" },
            { EmployeeId: 2, LastName: "Fuller", FirstName: "Andrew", Title: "Vice President, Sales", ReportsTo: null, BirthDate: "1952-02-19", HireDate: "1992-08-14", Address: "908 W. Capital Way", City: "Tacoma", State: "WA", Country: "USA", PostalCode: "98401", Phone: "(206) 555-9482", Fax: null, Email: "andrew@northwindtraders.com" },
            { EmployeeId: 3, LastName: "Leverling", FirstName: "Janet", Title: "Sales Representative", ReportsTo: 2, BirthDate: "1963-08-30", HireDate: "1992-04-01", Address: "722 Moss Bay Blvd.", City: "Kirkland", State: "WA", Country: "USA", PostalCode: "98033", Phone: "(206) 555-3412", Fax: null, Email: "janet@northwindtraders.com" }
          ]
          this.empleados = [...e]
          resolve();
        }, 5000);
      })

    },
    createEmpleado(empleado) {
      empleado.EmployeeId = this.empleados.length + 1;
      this.empleados.push(empleado);
    },
    updateEmpleado(updatedEmpleado) {
      const index = this.empleados.findIndex(emp => emp.id === updatedEmpleado.id);
      if (index !== -1) {
        this.empleados[index] = { ...this.empleados[index], ...updatedEmpleado };
      }
    },
    deleteEmpleado(empleadoId) {
      this.empleados = this.empleados.filter(emp => emp.id !== empleadoId);
    },
  },
});
