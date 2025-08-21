<template>
    <vue3-easy-data-table ref="dataTable"

    :headers="headers"
    :items="props.items"
    table-class-name="tableClassName"
    @click-row="on_click_row"
    show-index :rows-per-page="10" hide-footer
    body-row-class-name="bg-white hover:bg-gray-100 hover:cursor-pointer"
    body-item-class-name=" px-3 py-2 whitespace-nowrap">

    </vue3-easy-data-table>

</template>
<script setup>
    import { ref, defineModel, defineEmits } from 'vue';
    import Vue3EasyDataTable from "vue3-easy-data-table";

    const dataTable = ref();
    const emit = defineEmits(["clickRow"])

    const itemSelected = defineModel();
    const props = defineProps({
        items: {
            type: Array,
            required: true,
        }
    });

    const headers =[
        { text: "Ticker", value: "ticker" },
        { text: "Nombre", value: "nombre" },
        { text: "Tipo", value: "tipo" },
        { text: "Valor de mercado actual", value: "valormercado" },

    ]

    function on_click_row(item) {
        itemSelected.value = item
        emit("clickRow", item)
    }
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
