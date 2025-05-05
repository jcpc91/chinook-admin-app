// stores/crudStore.js
import { defineStore } from 'pinia'

export const useartistsStore = defineStore('medittypesstore', {
  state: () => ({
    items: [

    ]
  }),

  actions: {
    fetchItems() {


    },
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
      this.items = this.items.filter(i => i.id !== itemToRemove.id)

    },

    setItems(newItems) {
      this.items = newItems
    }
  }
})
