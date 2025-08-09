// stores/crudStore.js
import { useCatalogoFetch } from '@/services/api'
import { defineStore } from 'pinia'

export const useMediaTypeStore = defineStore('medittypesstore', {
  state: () => ({
    items: [],
  }),

  actions: {
    fetch() {
      return useCatalogoFetch('mediatypes')
        .get()
        .json()
        .then(({ data }) => (this.items = [...data.value]))
    },

    addItem(item) {
      return useCatalogoFetch('mediatypes')
        .post(item)
        .json()
        .then(({ data }) => {
          this.items.push(data.value)
          return data.value
        })
    },

    updateItem(updatedItem) {
      const index = this.items.findIndex((i) => i.id === updatedItem.id)
      if (index !== -1) {
        return useCatalogoFetch(`mediatypes/${updatedItem.id}`)
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
    /**
     * DELETE /mediatypes/:id
     * @param {any} itemToRemove
     */
    deleteItem(itemToRemove) {
      const index = this.items.findIndex((i) => i.id === itemToRemove.id)
      if (index !== -1) {
        return useCatalogoFetch(`mediatypes/${itemToRemove.id}`)
          .delete()
          .json()
          .then(({ data }) => {
            console.log('delete', data)
            this.items.splice(index, 1)
            return data.value
          })
      } else {
        return Promise.resolve()
      }
    },
  },
})
