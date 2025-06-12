// stores/crudStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAlbunesStore = defineStore('albunesStore', () => {
  const items = ref([])

  const getItems = computed(() => items.value)

  const fetchItems = () => {
    // Fetch logic here
  }

  const addItem = (item) => {
    item.id = new Date().getTime()
    item.tracks = []
    items.value.push(item)
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
    deleteItem
  }
});
