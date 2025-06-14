// stores/crudStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
const BASE_URL = import.meta.env.VITE_BASE_URL
const apiclient = {
  fetchItemsByArtistId: (artistId) => {
    const url = new URL(`albunes?artistid=${artistId}`, BASE_URL)
    return fetch(url)
  },
  postItem: (item) => {
    const url = new URL('albunes', import.meta.env.VITE_BASE_URL)
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    })
  },
  putItem: (item) => {
    const url = new URL(`albunes/${item.id}`, import.meta.env.VITE_BASE_URL)
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    })
  },

  deleteItem: (item) => {
    const url = new URL(`albunes/${item.id}`, BASE_URL)
    return fetch(url, {
      method: 'DELETE',
      
    })
  },
}
export const useAlbunesStore = defineStore('albunesStore', () => {
  const items = ref([])

  const getItems = computed(() => items.value)

  const fetchItems = () => {
    // Fetch logic here
  }

  const fetchItemsByArtistId = (artistId) => {
    return apiclient
      .fetchItemsByArtistId(artistId)
      .then((response) => response.json())
      .then((data) => {
        items.value = [...data]
        return data
      })
  }

  const addItem = (item) => {
    return apiclient
      .postItem(item)
      .then((response) => response.json())
      .then((data) => {
        items.value.push(data)
        return data
      })
  }

  const updateItem = (updatedItem) => {
    return apiclient
      .putItem(updatedItem)
      .then((response) => response.json())
      .then((data) => {
        const index = items.value.findIndex((i) => i.id === data.id)
        if (index !== -1) {
          items.value[index] = { ...items.value[index], ...data }
        }
        return data
      })
  }

  const deleteItem = (itemToRemove) => {
    return apiclient
      .deleteItem(itemToRemove)
      .then((response) => response.json())
      .then((data) => {
        items.value = items.value.filter((i) => i.id !== data.id)
        return data
      })
  }

  return {
    items,
    getItems,
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
    fetchItemsByArtistId,
  }
})
