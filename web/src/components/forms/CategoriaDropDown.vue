<template>
  
  <DropDown v-model="modelValue" label="Categoria" name="categoria" :options="data" item-value="id" item-title="title" />
  

</template>
<script setup>
import DropDown from "@/components/forms/InputSelect.vue";
import { useAsyncState } from '@vueuse/core'
import { useCatalogosStore } from "@/stores/catalogos";
import { reactive, defineModel, onMounted, computed } from "vue";

const catalogosStore = useCatalogosStore()
const {  execute } = useAsyncState(action, [], { immediate: false })
const modelValue = defineModel({ required: true });
  const data = computed(() => catalogosStore.categorias.map(m => ({id: m, title: m})))


onMounted(async () => {
  await execute(0)
})

async function action() {
  await catalogosStore.getcategorias()

}
</script>