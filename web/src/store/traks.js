import { defineStore } from 'pinia'
import { useMyFetch } from '@/stores/api'
import { ref, computed, reactive } from 'vue'




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
      .then(({data, error}) => {
        if (error.value)
          throw error.value
        traks.value.push(data.value)
        return data.value
      })
  }
  async function updateTrak(trak) {
    console.log('updateTrak', trak)
    return useMyFetch('traks')
      .put(trak)
      .json()
      .then(({data, error}) => {
        console.log('updateTrak', data, error)
        if (error.value)
          throw error.value

        const index = traks.value.findIndex((i) => i.id === data.value.id)
        traks.value[index] = {...traks.value[index], ...data.value}
        return data.value
      }
    )
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
    deleteTrak
  }
})
