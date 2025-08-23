import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useActivosStore = defineStore('activosStore', () => {
    const items = ref([
        { ticker: "AAPL", nombre: "Apple Inc.", tipo: "Acciones", valormercado: 150.75 },
        { ticker: "MSFT", nombre: "Microsoft Corporation", tipo: "Acciones", valormercado: 250.25 },
        { ticker: "GOOGL", nombre: "Alphabet Inc.", tipo: "Acciones", valormercado: 120.50 },
      ])
    const getItems = computed(() => items.value)
    const fetchItems = () => {
        items.value = []
    }
    const fetchItemById = (ticker) => {
        return items.value.find((item) => item.ticker == ticker)
    }
    const addItem = (item) => {
        items.value.push(item)
    }
    const updateItem = (item) => {
        const index = items.value.findIndex((i) => i.ticker == item.ticker)
        if (index !== -1) {
            items.value[index] = item
        }
    }
    const deleteItem = (item) => {
        items.value = items.value.filter((i) => i.ticker !== item.ticker)
    }
    return {
        items,
        getItems,
        fetchItems,
        fetchItemById,
        addItem,
        updateItem,
        deleteItem,
    }
})
