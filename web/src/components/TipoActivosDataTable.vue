<template>
  <vue3-easy-data-table ref="dataTable" :headers="headers" :items="props.items" table-class-name="tableClassName"
    @click-row="on_click_row" show-index :rows-per-page="10" hide-footer
    :header-item-class-name="headerItemClassNameFunction"
    body-row-class-name="bg-white hover:bg-gray-100 hover:cursor-pointer"
    body-item-class-name=" px-3 py-2 whitespace-nowrap">

  </vue3-easy-data-table>
</template>
<script setup>
import { ref, defineModel, defineEmits, onMounted } from 'vue';
import { useTipoActivosStore } from '@/stores/tiposActivos';
import Vue3EasyDataTable from "vue3-easy-data-table";

const store = useTipoActivosStore()
const dataTable = ref();
const emit = defineEmits(["clickRow"])
const itemSelected = defineModel('itemSelected');
const props = defineProps({
  items: {
    type: Array,
    required: true,
  }
});

const headers = [
  { text: "Código", value: "codigo" },
  { text: "Categoría", value: "categoria" },
  { text: "Subcategoría", value: "subcategoria" },
  { text: "Nivel de Riesgo", value: "nivelriesgo" },
  { text: "Horizonte de Inversión", value: "horizonteinversion" },
  { text: "Liquidez", value: "liquidez" }
]

function on_click_row(item) {
  itemSelected.value = item
  emit("clickRow", item)
}
function headerItemClassNameFunction() { }

onMounted(async () => {
  const result = await store.fetchItems()
  console.log(result)
})

</script>
<style >
.vue3-easy-data-table table {
  border-collapse: initial;
  display: table;
  width: 100%;
  border-spacing: 0;
  margin: 0;
}
</style>
