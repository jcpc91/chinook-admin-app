// stores/crudStore.js
import { defineStore } from 'pinia'
const BASE_URL = import.meta.env.VITE_BASE_URL;

const apiclient = {
  fetchItems: () => {
    const url = new URL("generos", BASE_URL)
    return fetch(url)
  },
  postItem: (item) => {
    const url = new URL("generos", BASE_URL)
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item)
    })
  },
  putItem: (item)  => {
    const url = new URL(`generos/${item.id}`, BASE_URL)
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item)
    })
  },
  deleteItem: (item) => {
    const url = new URL(`generos/${item.id}`, BASE_URL)
    return fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item)
    })
  }
}
export const useGenerosStore = defineStore('generosStore', {
  state: () => ({
    items: [

    ]
  }),

  actions: {
    fetch() {
      return apiclient.fetchItems()
      .then(response => response.json())
      .then(data => {
        this.items = [...data]
        return data
      })
    },
    addItem(item) {
      return apiclient.postItem(item)
      .then(response => response.json())
      .then(data => {
        this.items.push(data)
        return data
      })
    },

    updateItem(updatedItem) {

      const index = this.items.findIndex(i => i.id === updatedItem.id)
      if (index !== -1) {
        return apiclient.putItem(updatedItem)
        .then(response => response.json())
        .then(data => {
          this.items[index] = { ...this.items[index], ...data }
          return data
        })
      } else {
        return Promise.resolve()
      }
    },
    deleteItem(itemToRemove) {
      const index = this.items.findIndex(i => i.id === itemToRemove.id)
      if (index !== -1) {
        return apiclient.deleteItem(itemToRemove)
        .then(response => response.json())
        .then(data => {
          this.items.splice(index, 1)
          return data
        })
      } else {
        return Promise.resolve()
      }
    },
    
  }
})
