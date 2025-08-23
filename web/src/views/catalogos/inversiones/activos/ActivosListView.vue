<template>
  <Panel title="Activos">
    <template #buttons>
      <Button label="Nuevo"
      @click="router.push({ name: 'inversiones-activos-new' })"></Button>
    </template>
    <RouterView name="top" />
    <ActivosDataTable :items="items" @click-row="on_row_clicked" />

    <RouterView name="bottom" />
  </Panel>
</template>
<script setup>
import { ref } from 'vue';
import ActivosDataTable from "@/components/ActivosDataTable.vue";
import Panel from "@/components/common/PanelComponent.vue";
import Button from '@/components/forms/InputButton.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const items = ref([
  { ticker: "AAPL", nombre: "Apple Inc.", tipo: "Acciones", valormercado: 150.75 },
  { ticker: "MSFT", nombre: "Microsoft Corporation", tipo: "Acciones", valormercado: 250.25 },
  { ticker: "GOOGL", nombre: "Alphabet Inc.", tipo: "Acciones", valormercado: 120.50 },
])

function on_row_clicked(item) {
  router.push({ name: 'inversiones-activos-detalle', params: { ticker: item.ticker } })
}
</script>
