// stores/crudStore.js
import { defineStore } from 'pinia'
const BASE_URL = import.meta.env.VITE_BASE_URL;

const apiclient = {
  postItem: (item) => {
    const url = new URL("mediatypes", BASE_URL)
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item)
    })
  }
}
export const useMediaTypeStore = defineStore('medittypesstore', {
  state: () => ({
    items: [

    ]
  }),

  actions: {
    /**
     * POST /mediatypes
     * @param {any} item
     */
    addItem(item) {
      return apiclient.postItem(item)
      .then(response => response.json())
      .then(data => {
        this.items.push(data)
        return data
      })
    },
    /**
     * PUT /mediatypes
     * @param {any} updatedItem
     */
    updateItem(updatedItem) {
      const index = this.items.findIndex(i => i.id === updatedItem.id)
      if (index !== -1) {
        this.items[index] = { ...this.items[index], ...updatedItem }
      }
    },
    /**
     * DELETE /mediatypes/:id
     * @param {any} itemToRemove
     */
    deleteItem(itemToRemove) {
      const index = this.items.findIndex(i => i.id === itemToRemove.id)
      this.items.splice(index, 1)
    },

    setItems(newItems) {
      this.items = newItems
    }
  }
})
