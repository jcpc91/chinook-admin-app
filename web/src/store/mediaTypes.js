// stores/crudStore.js
import { useMyFetch } from "@/stores/api";
import { defineStore } from 'pinia'


export const useMediaTypeStore = defineStore('medittypesstore', {
  state: () => ({
    items: [

    ]
  }),

  actions: {
    fetch() {
      return useMyFetch('mediatypes').get().json()
      .then(({data}) => this.items = [...data.value])
    },

    addItem(item) {
        return useMyFetch('mediatypes').post(item).json()
        .then(({data}) => {
            this.items.push(data.value)
            return data.value
        })
    },

    updateItem(updatedItem) {

      const index = this.items.findIndex(i => i.id === updatedItem.id)
      if (index !== -1) {
        return useMyFetch(`mediatypes/${updatedItem.id}`).put(updatedItem).json()
        .then(({data}) => {
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
      const index = this.items.findIndex(i => i.id === itemToRemove.id)
      if (index !== -1) {
        return useMyFetch(`mediatypes/${itemToRemove.id}`).delete().json()
        .then(({data}) => {
            console.log('delete', data)
          this.items.splice(index, 1)
          return data.value
        })
      } else {
        return Promise.resolve()
      }
    },

  }
})
