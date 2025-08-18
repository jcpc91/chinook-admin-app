// stores/crudStore.js
import { defineStore } from 'pinia'
import { useCatalogoFetch } from '@/services/api'

export const useartistsStore = defineStore('artistsStore', {
  state: () => ({
    items: [],
  }),
  getters: {
    getItems: (state) => {
      return state.items
    },
  },

  actions: {
    fetchItems() {
      return useCatalogoFetch('artistas')
        .get()
        .json()
        .then(({ data }) => (this.items = [...data.value]))
    },
    addItem(item) {
      return useCatalogoFetch('artistas')
        .post(item)
        .json()
        .then(({ data }) => {
          this.items.push(data.value)
          return data.value
        })
    },
    getItem(id) {
      return useCatalogoFetch(`artistas/${id}`)
        .get()
        .json()
        .then(({ data }) => data.value)
    },
    updateItem(updatedItem) {
      const index = this.items.findIndex((i) => i.id === updatedItem.id)
      if (index !== -1) {
        return useCatalogoFetch(`artistas/${updatedItem.id}`)
          .put(updatedItem)
          .json()
          .then(({ data }) => {
            this.items[index] = { ...this.items[index], ...data.value }
            return data.value
          })
      } else {
        return Promise.resolve()
      }
    },

    deleteItem(itemToRemove) {
      const index = this.items.findIndex((i) => i.id === itemToRemove.id)
      if (index !== -1) {
        return useCatalogoFetch(`artistas/${itemToRemove.id}`)
          .delete()
          .json()
          .then(({ data }) => {
            this.items.splice(index, 1)
            return data.value
          })
      } else {
        return Promise.resolve()
      }
    },
  },
})
