import { defineStore } from 'pinia'
import { ref, reactive, shallowReactive, computed } from 'vue'
import { useInversionesFetch } from '@/services/api'

export const useActivosStore = defineStore('activosStore', () => {
    const items = shallowReactive([])
    const getItems = computed(() => items)
    const fetchItems = () => {
        const data =[
            { ticker: "AAPL", nombre: "Apple Inc.", tipo: "Acciones", valormercado: 150.75 },
            { ticker: "MSFT", nombre: "Microsoft Corporation", tipo: "Acciones", valormercado: 250.25 },
            { ticker: "GOOGL", nombre: "Alphabet Inc.", tipo: "Acciones", valormercado: 120.50 },
          ]
          items.push( ...data)
    }
    const fetchItemById = (ticker) => {
        return items.find((item) => item.ticker == ticker)
    }
    const addItem = (item) => {
        items.push(item)
    }
    const updateItem = (item) => {
        const index = items.findIndex((i) => i.ticker == item.ticker)
        if (index !== -1) {
            items[index] = item
        }
    }
    const deleteItem = (item) => {
        const data = items.filter((i) => i.ticker !== item.ticker)
        items.push(...data)
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
