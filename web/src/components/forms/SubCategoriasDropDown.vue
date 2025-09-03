<template>
  <DropDown v-model="modelValue" label="Subcategoria" name="subcategoria" :options="data" item-value="id"
    item-title="title" />
</template>
<script setup>
import { reactive, defineModel, onMounted, computed, defineProps, watch } from "vue";
import DropDown from "@/components/forms/InputSelect.vue";
import { useAsyncState } from '@vueuse/core'
import { useCatalogosStore } from "@/stores/catalogos";


const catalogosStore = useCatalogosStore()
const { execute } = useAsyncState(action, [], { immediate: false })
const props = defineProps(['categoria'])
const modelValue = defineModel({ required: true });
const data = reactive([])

watch(() => props.categoria, async (newValue) => {
  await execute(0, newValue)
})

function action(categoria) {
  console.log(categoria)
  const d = catalogosStore.getsubcategorias(categoria)
  data.splice(0, data.length)
  data.push(...d.map(m => ({ id: m.subcategoria, title: m.subcategoria })))
}
</script>