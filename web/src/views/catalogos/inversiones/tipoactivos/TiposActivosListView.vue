<template>
  <Panel title="Tipos de Activos">
    <template #buttons>
      <Button label="Nuevo" @click="router.push({ name: 'inversiones-tiposactivos-new' })"></Button>
    </template>
    <RouterView name="top" />
    <TipoActivosDataTable v-model:item-selected="itemSelected" :items="items" />
    <RouterView name="bottom" />
  </Panel>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { reactify, useAsyncState } from '@vueuse/core'
import { useRouter } from 'vue-router'
import Panel from "@/components/common/PanelComponent.vue";
import Button from '@/components/forms/InputButton.vue'
import TipoActivosDataTable from '@/components/TipoActivosDataTable.vue'

const router = useRouter()
const itemSelected = ref()
const items = ref([
  { codigo: "1", categoria: "Acciones", subcategoria: "Acciones Ordinarias", nivelriesgo: "Alto", horizonteinversion: "Largo Plazo", liquidez: "Baja" },
  { codigo: "2", categoria: "Bonos", subcategoria: "Bonos Corporativos", nivelriesgo: "Medio", horizonteinversion: "Mediano Plazo", liquidez: "Media" },
])
</script>