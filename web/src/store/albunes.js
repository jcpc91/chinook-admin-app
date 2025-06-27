// stores/crudStore.js
import { defineStore } from 'pinia'
import { useMyFetch } from '@/stores/api'
import { ref, computed, reactive } from 'vue'

export const useAlbunesStore = defineStore('albunesStore', () => {
  const items = ref([])

  const getItems = computed(() => items.value)

  const fetchItems = () => {
    // Fetch logic here
  }

  const fetchItemsByArtistId = (artistId) => {
    return useMyFetch(`albunes?artistid=${artistId}`)
      .get()
      .json()
      .then(({ data }) => {
        items.value = [...data.value]
        return data.value
      })
  }

  const addItem = (item) => {
    return useMyFetch('albunes')
      .post(item)
      .json()
      .then(({ data }) => {
        items.value.push(data.value)
        return data.value
      })
  }

  const updateItem = (updatedItem) => {
    console.log('updateItem', updatedItem)
    const index = items.value.findIndex((i) => i.id == updatedItem.id)
    if (index !== -1) {
      return useMyFetch(`albunes/${updatedItem.id}`)
        .put(updatedItem)
        .json()
        .then(({ data }) => {
          items.value[index] = { ...items.value[index], ...data.value }

          return data.value
        })
    } else {
      return Promise.resolve()
    }
  }

  const deleteItem = (itemToRemove) => {
    return useMyFetch(`albunes/${itemToRemove.id}`)
      .delete()
      .json()
      .then(({ data }) => {
        items.value = items.value.filter((i) => i.id !== data.value.id)
        return data.value
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
