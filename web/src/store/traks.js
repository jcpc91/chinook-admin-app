import { defineStore } from 'pinia'
const BASE_URL = import.meta.env.VITE_BASE_URL;
const api = {
  fetchItemsByAlbums: (idalbum) => {
    const url = new URL("traks", BASE_URL)
    url.searchParams.append("albumId", idalbum)
    return fetch(url)
    .then((response) => response.json())
  },
  fetchItemId: (id) => {
    const url = new URL(`traks/${id}`, BASE_URL)
    return fetch(url)
    .then((response) => response.json())
  },
  postItem: (data) => {
    const url = new URL("traks", BASE_URL)
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then((response) => response.json())
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
      try {
        const data = await api.fetchItemsByAlbums(albumid)
        this.traks = [...data]
      } catch (error) {
        this.error = error
      } finally {
        this.loading = false
      }
    },
    async fetchTrak(id) {
      this.loading = true
      try {
        const data = await api.fetchItemId(id)
        return data
      } catch (e) {}
      finally {
        this.loading = false
      }
    },
    async createTrak(trak) {
      this.loading = true
      try {
        const data = await api.postItem(trak)
        this.traks.push(data)
      } catch (error) {
        this.error = error
      } finally {
        this.loading = false
      }
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
