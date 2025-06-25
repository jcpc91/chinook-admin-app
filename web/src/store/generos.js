// stores/crudStore.js
import { defineStore } from 'pinia'
import { useMyFetch } from "@/stores/api";

export const useGenerosStore = defineStore('generosStore', {
  state: () => ({
    items: [

    ]
  }),

  actions: {
    fetch() {
      return useMyFetch('generos').get().json()
      .then(({data}) => {
        this.items = [...data.value]
        return data.value
      })
    },
    addItem(item) {
      return useMyFetch('generos').post(item).json()
      .then(({data}) => {
        this.items.push(data.value)
        return data.value
      })
    },

    updateItem(updatedItem) {

      const index = this.items.findIndex(i => i.id === updatedItem.id)
      if (index !== -1) {
        return useMyFetch(`generos/${updatedItem.id}`).put(updatedItem).json()
        .then(({data}) => {
          this.items[index] = { ...this.items[index], ...data.value }
          return data.value
        })
      } else {
        return Promise.resolve()
      }
    },
    deleteItem(itemToRemove) {
      const index = this.items.findIndex(i => i.id === itemToRemove.id)
      if (index !== -1) {
        return useMyFetch(`generos/${itemToRemove.id}`).delete()
        .then(({data}) => {
          this.items.splice(index, 1)
          return data.value
        })
      } else {
        return Promise.resolve()
      }
    },

  }
})
