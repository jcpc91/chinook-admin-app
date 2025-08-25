<template>
  <Panel title="Activos">
    <template #buttons>
      <Button label="Nuevo"
      @click="router.push({ name: 'inversiones-activos-new' })"></Button>
    </template>
    <RouterView name="top" />
    <ActivosDataTable :items="store.getItems" @click-row="on_row_clicked" />

    <RouterView name="bottom" />
  </Panel>
</template>
<script setup>
import { onMounted } from "vue";
import ActivosDataTable from "@/components/ActivosDataTable.vue";
import Panel from "@/components/common/PanelComponent.vue";
import Button from '@/components/forms/InputButton.vue'
import { useRouter } from 'vue-router'
import { useActivosStore } from '@/stores/activos';

const store = useActivosStore()
const router = useRouter()


function on_row_clicked(item) {
  router.push({ name: 'inversiones-activos-detalle', params: { ticker: item.ticker } })
}

onMounted(() => {
  store.fetchItems()
})
</script>
