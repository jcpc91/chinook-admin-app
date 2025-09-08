import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import { useInversionesFetch } from '@/services/api'

export const useTipoActivosStore = defineStore('tiposActivosStore', () => {
    const items = reactive([])
    const getItems = computed(() => items)

    const fetchItems = () => {
        
        return useInversionesFetch('tiposactivos', {
            immediate: false,
            beforeFetch: (p) => {
                console.log('beforeFetch', p)
            },
            onFetchError: (p) => {
                console.log('onFetchError', p)
            },
            afterFetch: ({ data }) => {
                console.log('afterFetch', data)
                items.splice(0, items.length)
                items.push(...data)
            },
        })
            .get()
            .json()
        /*.then(({ data, error, response, statusCode }) => {
            if (statusCode.value >= 400) {
                throw new Error(error.value)
            }
            items.splice(0, items.length)
            items.push(...data.value)
        })
          */
    }
    /* useInversionesFetch('tiposactivos', { immediate: false })
            .get()
            .json()
            .then(({ data, error, response, statusCode }) => {
                if (statusCode.value >= 400) {
                    throw new Error(error.value)
                }
                items.splice(0, items.length)
                items.push(...data.value)
            })
            .catch((error) => {
                console.error(error)
            })
            */
    function fetchItemById(codigo) {
        return items.find((item) => item.codigo == codigo)
    }
    function addItem(item) {
        return useInversionesFetch('tiposactivos')
        .post(item)
        .json()
        .then(({ data, error, response, statusCode }) => {
            if (statusCode.value >= 400) {
                throw new Error(error.value)
            }
        })
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
