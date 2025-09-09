<template>
  <Panel title="Tipos de Activos">
    <template #buttons>
      <Button label="Nuevo" @click="router.push({ name: 'inversiones-tiposactivos-new' })"></Button>
    </template>
    <RouterView name="top" />
    <TipoActivosDataTable :items="store.items" @click-row="on_row_clicked" />
    <RouterView name="bottom" />
  </Panel>
</template>
<script setup>
//import { reactify, useAsyncState } from '@vueuse/core'
import { useRouter } from 'vue-router'
import Panel from "@/components/common/PanelComponent.vue";
import Button from '@/components/forms/InputButton.vue'
import TipoActivosDataTable from '@/components/TipoActivosDataTable.vue'
import { useTipoActivosStore } from '@/stores/tiposActivos';

const store = useTipoActivosStore()
const router = useRouter()


function on_row_clicked(item) {
  router.push({ name: 'inversiones-tiposactivos-detalle', params: { codigo: item.codigo } })
}
</script>
