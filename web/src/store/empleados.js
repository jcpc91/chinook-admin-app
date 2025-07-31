import { defineStore } from 'pinia';
import { useMyFetch } from '@/stores/api'
import { ref, computed, reactive } from 'vue'

export const useEmpleadosStore = defineStore('empleados', () => {
  const empleados = ref([])
  const err = ref(null)

  const fetchEmpleados = () => useMyFetch('employees')
    .get()
    .json()
    .then(({ data, error }) => {
      if (error.value)
        throw error.value

      empleados.value = [...data.value]
      return data.value
    })

  const createEmpleado = (empleado) => useMyFetch('employees')
    .post(empleado)
    .json()
    .then(({ data, error }) => {
      if (error.value)
        throw error.value
      empleados.value.push(data.value)
    })

  function getEmpleadoById(id) {
    return useMyFetch(`employees/${id}`)
    .get()
    .json()
    .then(({ data, error }) => {
      if (error.value)
        throw error.value
      return data.value
    })
  }

  function updateEmpleado(empleado) {
    return useMyFetch(`employees`)
    .put(empleado)
    .json()
    .then(({ data, error }) => {
      if (error.value)
        throw error.value
      const index = empleados.value.findIndex(emp => emp.id === data.value.id);
      if (index !== -1) {
        empleados.value[index] = { ...empleados.value[index], ...data.value };
      }
      return data.value
    })
  }
  return {
    err,
    empleados,
    fetchEmpleados,
    createEmpleado,
    getEmpleadoById,
    updateEmpleado,
    //deleteEmpleado,
  }
  /*state: () => ({
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
  },*/
});
