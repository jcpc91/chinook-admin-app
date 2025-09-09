<template>
  <DropDown v-model="modelValue" label="Tipo de Activo" name="tipo" :options="store.getCatalogoItems" item-value="id"
    item-title="title" />
</template>
<script setup>
import { ref, defineModel, defineProps, onMounted, computed } from "vue";
import DropDown from "@/components/forms/InputSelect.vue";
import { useTipoActivosStore } from "@/stores/tiposActivos";

const store = useTipoActivosStore();



const modelValue = defineModel();
onMounted(() => {
  store.fetchItems();
})
</script>