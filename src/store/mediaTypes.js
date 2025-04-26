// stores/crudStore.js
import { defineStore } from 'pinia'

export const useMediaTypeStore = defineStore('medittypesstore', {
  state: () => ({
    items: [
      { id: 1, title: 'Primer ítem' },
      { id: 2, title: 'Segundo ítem' }
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
      throw new Error('No se puede eliminar (escenario 0')
      //this.items = this.items.filter(i => i.id !== itemToRemove.id)
    },

    setItems(newItems) {
      this.items = newItems
    }
  }
})
