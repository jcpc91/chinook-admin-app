// stores/crudStore.js
import { defineStore } from 'pinia'

export const useAlbunesStore = defineStore('albunesStore', {
  state: () => ({
    items: [

    ]
  }),
  getters: {
    getItems: (state) => state.items
  },
  actions: {
    fetchItems() {


    },
    addItem(item) {
      item.id = new Date().getTime()
      this.items.push(item)
    },

    updateItem(updatedItem) {
      console.log(updatedItem);

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
