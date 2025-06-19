import { defineStore } from 'pinia';
const BASE_URL = import.meta.env.VITE_BASE_URL
const api = {
  fetchEmpleados: () => {
    const url = new URL('employees', BASE_URL)
    return fetch(url).then((response) => response.json())
  },
  postEmpleado: (empleado) => {
    const url = new URL('employees', BASE_URL)
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(empleado),
    }).then((response) => response.json())
  }
}
export const useEmpleadosStore = defineStore('empleados', {
  state: () => ({
    empleados: [],
  }),
  getters: {
    getEmpleados: (state) => state.empleados,
    getEmpleadoById: (state) => (id) => state.empleados.find(emp => emp.id == id),
  },
  actions: {
    async fetchEmpleados() {
      try {
        const data = await api.fetchEmpleados()
        this.empleados = [...data]
      } catch (error) {
        
      }
    },
    async createEmpleado(empleado) {
      const data = await api.postEmpleado(empleado)
      this.empleados.push(data);
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
