import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { useCatalogoFetch } from '@/services/api'
import { useAsyncState } from '@vueuse/core'

export const useCatalogosStore = defineStore('catalogos', () => {
  /**
   * @type Array<{
    "categoria": string,
    "subcategoria": string,
    "descripcion": string
  }>
   */
  const items = reactive([])
  const categorias = computed(() => [...new Set(items.map((item) => item.categoria))].sort())
  /*const getcategorias = useCatalogoFetch('artistas')
  .get()
  .json()
  .then(({ data }) =>  {
    categorias.value = [...data.value]})
  */

  const getcategorias = () =>
    useCatalogoFetch('public/data/categorias.json')
      .get()
      .json()
      .then(({ data }) => {
        items.push(...data.value)
        return data.value
      })
  return {
    items,
    getcategorias,
    categorias,
  }
})
