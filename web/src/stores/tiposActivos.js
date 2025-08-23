import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTipoActivosStore = defineStore('tiposActivosStore', () => {
    const items = ref([
        { codigo: "1", categoria: "Acciones", subcategoria: "Acciones Ordinarias", nivelriesgo: "Alto", horizonteinversion: "Largo Plazo", liquidez: "Baja" },
        { codigo: "2", categoria: "Bonos", subcategoria: "Bonos Corporativos", nivelriesgo: "Medio", horizonteinversion: "Mediano Plazo", liquidez: "Media" },
    ])
    const getItems = computed(() => items.value)

    function fetchItems() {

    }
    function fetchItemById(codigo) {
        return items.value.find((item) => item.codigo == codigo)
    }
    function addItem(item) {
        items.value.push(item)
    }
    function updateItem(item) {
        const index = items.value.findIndex((i) => i.codigo == item.codigo)
        if (index !== -1) {
            items.value[index] = item
        }
    }
    function deleteItem(item) {
        items.value = items.value.filter((i) => i.codigo !== item.codigo)
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
