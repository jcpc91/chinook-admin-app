import { defineStore } from 'pinia';

export const useEmpleadosStore = defineStore('empleados', {
  state: () => ({
    empleados: [],
  }),
  getters: {
    getEmpleados: (state) => state.empleados,
    getEmpleadoById: (state) => (id) => state.empleados.find(emp => emp.id === id),
  },
  actions: {
    createEmpleado(empleado) {
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
