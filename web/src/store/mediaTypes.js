// stores/crudStore.js
import { defineStore } from 'pinia'

export const useMediaTypeStore = defineStore('medittypesstore', {
  state: () => ({
    items: [

    ]
  }),

  actions: {
    addItem(item) {
      this.items.push(item)
    },
    updateItem(updatedItem) {
      const index = this.items.findIndex(i => i.id === updatedItem.id)
      if (index !== -1) {
        this.items[index] = { ...this.items[index], ...updatedItem }
      }
    },

    deleteItem(itemToRemove) {
      const index = this.items.findIndex(i => i.id === itemToRemove.id)
      this.items.splice(index, 1)
    },

    setItems(newItems) {
      this.items = newItems
    }
  }
})
