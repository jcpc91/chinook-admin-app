import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import { useInversionesFetch } from '@/services/api'

export const useTipoActivosStore = defineStore('tiposActivosStore', () => {
    const items = reactive([])
    const getCatalogoItems = computed(() =>
        items.map((i) => ({
            id: i.codigo,
            title: i.categoria + ' - ' + i.subcategoria,
        })),
    )

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
                items.push(data.value)
            })
    }
    function updateItem(item) {
        return useInversionesFetch('tiposactivos')
            .put(item)
            .json()
            .then(({ data, error, response, statusCode }) => {
                if (statusCode.value >= 400) throw new Error(error.value)

                const index = items.findIndex((i) => i.codigo == data.value.codigo)
                if (index !== -1) {
                    items[index] = item
                }
            })
    }
    function deleteItem(item) {
        items.filter((i) => i.codigo !== item.codigo)
    }

    return {
        items,
        getCatalogoItems,
        fetchItems,
        fetchItemById,
        addItem,
        updateItem,
        deleteItem,
    }
})
