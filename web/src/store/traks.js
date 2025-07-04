import { defineStore } from 'pinia'
import { useMyFetch } from '@/stores/api'
import { reactify, useAsyncState } from '@vueuse/core'
import { ref, computed, reactive } from 'vue'

const BASE_URL = import.meta.env.VITE_BASE_URL
const api = {
  
  fetchItemId: (id) => {
    const url = new URL(`traks/${id}`, BASE_URL)
    return fetch(url).then((response) => response.json())
  },
  postItem: (data) => {
    return useMyFetch('traks').post(data).json()
  },
  putItem: (data) => {
    const url = new URL(`traks/${data.id}`, BASE_URL)
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => response.json())
  },
}



export const useTraksStore = defineStore('traks', () => {
  
  const traks = ref([])
  const getTraks = computed(() => traks.value)
  

  const fetchTraks = (idalbum) => { 
    return useMyFetch(`traks?albumid=${idalbum}`).get().json()
    .then(({data}) => { 
      traks.value = [...data.value]
      return data.value
    })
  }

  function fetchTrak(id) {
    return useMyFetch(`traks?albumid=${args.idalbum}`).get().json()
    .then(({data}) => { 
      traks.value = [...data.value]
      return data.value
    })
  }
  async function createTrak(trak) {
    return useMyFetch('traks').post(trak).json()
    .then(({data}) => {
      traks.value.push(data.value)
      return data.value
    })
  }
  async function updateTrak(trak) {
    this.loading = true
    try {
      const data = await api.putItem(trak)
      const index = this.traks.findIndex((item) => item.id === data.id)
      if (index !== -1) {
        this.traks.splice(index, 1, data)
      }
    } catch (error) {
      this.error = error
    } finally {
      this.loading = false
    }
  }

  async function deleteTrak(id) {
    this.loading = true
  }
  return {
    getTraks,
    fetchTraks,
    fetchTrak,
    createTrak,
    updateTrak,
    deleteTrak,
  }
})
