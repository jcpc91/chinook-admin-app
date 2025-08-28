import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { useCatalogoFetch } from '@/services/api'
import { useAsyncState } from '@vueuse/core'

export const useCatalogosStore = defineStore('catalogos', () => {
  const getcategorias = useAsyncState(async () => {
    const response = await useCatalogoFetch('/data/categorias.json')
    const data = await response.json()
    return data
  }, [], { immediate: false })

  return {
    getcategorias,
  }
})