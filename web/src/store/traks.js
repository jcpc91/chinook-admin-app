import { defineStore } from 'pinia'
import { useMyFetch } from "@/stores/api";
const BASE_URL = import.meta.env.VITE_BASE_URL;
const api = {
  fetchItemsByAlbums: (idalbum) => {
    return useMyFetch(`traks?albumid=${idalbum}`).get().json()
  },
  fetchItemId: (id) => {
    const url = new URL(`traks/${id}`, BASE_URL)
    return fetch(url)
    .then((response) => response.json())
  },
  postItem: (data) => {
    return useMyFetch('traks').post(data).json()
  },
  putItem: (data) => {
    const url = new URL(`traks/${data.id}`, BASE_URL)
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then((response) => response.json())
  }
}
export const useTraksStore = defineStore('traks', {
  state: () => ({
    traks: [],
    loading: false,
    error: null,
  }),

  getters: {
    getTraks: (state) => state.traks,
    isLoading: (state) => state.loading,
    hasError: (state) => state.error,
  },

  actions: {
    async fetchTraks(albumid) {
      this.loading = true
        const { data, error, execute, statusCode } = await api.fetchItemsByAlbums(albumid)
        this.traks = [...data]
        return { data, error, execute, statusCode }
    },
    async fetchTrak(id) {
      this.loading = true
      try {
        const data = await api.fetchItemId(id)
        return data
      } catch (e) {
        console.log(e)
      }
      finally {
        this.loading = false
      }
    },
    async createTrak(trak) {
        const { data, error, execute, statusCode } = await api.postItem(trak)
        console.log(data)
        this.traks.push(data.value)
        return { data, error, execute, statusCode }
    },

    async updateTrak(trak) {
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
    },

    async deleteTrak(id) {
      this.loading = true

    },
  },
})
