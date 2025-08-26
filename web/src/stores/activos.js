import { defineStore } from 'pinia'
import { ref, reactive, shallowReactive, computed } from 'vue'
import { useInversionesFetch } from '@/services/api'

export const useActivosStore = defineStore('activosStore', () => {
    const items = shallowReactive([])
    const getItems = computed(() => items)
    const fetchItems = () => {
        items.splice(0, items.length)
        return useInversionesFetch('activos')
          .get()
          .json()
          .then(({ data }) => items.push(...data.value))
    }
    const fetchItemById = (ticker) => {
        return items.find((item) => item.ticker == ticker)
    }
    const addItem = (item) => {
        return useInversionesFetch('activos')
          .post(item)
          .json()
          .then(({ data }) => {
            items.push(data.value)
            return data.value
          })
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
