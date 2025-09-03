import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'

export const useTipoActivosStore = defineStore('tiposActivosStore', () => {
    const items = reactive([])
    const getItems = computed(() => items)

    function fetchItems() {
        items.push(...[
            { "categoria": "Renta Variable", "subcategoria": "Acciones individuales", "codigo": "4f23", "horizonteinversion": "Mediano Plazo", "nivelriesgo": "Medio", "liquidez": "Media" }
        ])
    }
    function fetchItemById(codigo) {
        return items.find((item) => item.codigo == codigo)
    }
    function addItem(item) {
        items.push(item)
    }
    function updateItem(item) {
        const index = items.findIndex((i) => i.codigo == item.codigo)
        if (index !== -1) {
            items[index] = item
        }
    }
    function deleteItem(item) {
        items.filter((i) => i.codigo !== item.codigo)
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
