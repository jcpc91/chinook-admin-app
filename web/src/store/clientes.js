import { defineStore } from 'pinia'
import { useMyFetch } from '@/stores/api'
import { ref, computed, reactive } from 'vue'

export const useClientesStore = defineStore('clientes', () => {
  const customers = ref([])
  const err = ref(null)

  const fetchCustomers = useMyFetch('customers')
    .get()

    .then(({ data, error }) => {
      if (error.value) throw error.value
      customers.value = [...data.value]
      return data.value
    })

  async function fetchCustomer(id) {
    return useMyFetch(`customers/${id}`)
      .get()
      .json()
      .then(({ data, error }) => {
        if (error.value) throw error.value
        return data.value
      })
  }

  async function createCustomer(customer) {
    return useMyFetch('customers')
      .post(customer)
      .json()
      .then(({ data, error }) => {
        if (error.value) throw error.value
        customers.value.push(data.value)
      })
  }

  async function updateCustomer(customer) {
    return useMyFetch('customers')
      .put(customer)
      .json()
      .then(({ data, error }) => {
        if (error.value) throw error.value
        const index = customers.value.findIndex((c) => c.CustomerId === data.value.CustomerId)
        if (index !== -1) {
          customers.value[index] = { ...customers.value[index], ...data.value }
        }
        return data.value
      })
  }

  async function deleteCustomer(id) {
    return useMyFetch(`customers/${id}`)
      .delete()
      .json()
      .then(({ data, error }) => {
        if (error.value) throw error.value
        customers.value = customers.value.filter((c) => c.CustomerId !== id)
      })
  }

  return {
    err,
    customers,
    fetchCustomers,
    fetchCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  }
})
