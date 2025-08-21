<template>
  <Panel title="Activos">
    <template #buttons>
      <Button label="Nuevo" @click="router.push({ name: 'inversiones-tiposactivos-detalle' })"></Button>
    </template>
    <RouterView name="top" />
    <ActivosDataTable v-model="itemSelected" :items="items" />
    <div>{{ itemSelected }}</div>
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
const itemSelected = ref()
const items = ref([
  { ticker: "AAPL", nombre: "Apple Inc.", tipo: "Acciones", valormercado: 150.75 },
  { ticker: "MSFT", nombre: "Microsoft Corporation", tipo: "Acciones", valormercado: 250.25 },
  { ticker: "GOOGL", nombre: "Alphabet Inc.", tipo: "Acciones", valormercado: 120.50 },
])
</script>
