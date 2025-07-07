import { defineStore } from 'pinia'
import { useMyFetch } from '@/stores/api'
import { reactify, useAsyncState } from '@vueuse/core'
import { ref, computed, reactive } from 'vue'




export const useTraksStore = defineStore('traks', () => {
  const loading = ref(false)
  const error = ref(null)
  const traks = ref([])
  const getTraks = computed(() => traks.value)


  const fetchTraks = (idalbum) => {
    return useMyFetch(`traks?albumid=${idalbum}`).get().json()
    .then(({data}) => {
      traks.value = [...data.value]
      return data.value
    })
  }

  function fetchTrakById(idTrack) {
    return useMyFetch(`traks/${idTrack}`)
    .get()
    .json()
    .then(({data}) => {
      return data.value
    })
  }
  async function createTrak(trak) {
    return useMyFetch('traks')
      .post(trak)
      .json()
      .then(({data}) => {
        traks.value.push(data.value)
        return data.value
      })
  }
  async function updateTrak(trak) {
    loading.value = true
    try {
      const {data, error} = await useMyFetch('traks')
        .put(trak)
        .json()
      if (error.value)
        throw error.value
      const index = traks.findIndex((item) => item.id === data.value.id)
      if (index !== -1) {
        traks.splice(index, 1, data.value)
      }
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  async function deleteTrak(id) {
    this.loading = true
  }
  return {
    getTraks,
    fetchTraks,
    fetchTrakById,
    createTrak,
    updateTrak,
    deleteTrak,
    error,
    loading
  }
})
