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
  }
}
export const useAlbunesStore = defineStore('albunesStore', () => {
  const items = ref([])

  const getItems = computed(() => items.value)

  const fetchItems = () => {
    // Fetch logic here
  }

  const fetchItemsByArtistId = (artistId) => {
    return apiclient.fetchItemsByArtistId(artistId)
    .then(response => response.json())
    .then(data => {
      items.value = [...data]
      return data
    })
  }

  const addItem = (item) => {
    return apiclient.postItem(item)
    .then(response => response.json())
    .then(data => {
      items.value.push(data)
      return data
    })

  }

  const updateItem = (updatedItem) => {
    const index = items.value.findIndex(i => i.id === updatedItem.id)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...updatedItem }
    }
  }

  const deleteItem = (itemToRemove) => {
    items.value = items.value.filter(i => i.id !== itemToRemove.id)
  }


  return {
    items,
    getItems,
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
    fetchItemsByArtistId
  }
});
