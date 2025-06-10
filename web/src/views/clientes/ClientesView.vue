<template>
  <Panel title="Clientes">
    <template #buttons>
      <Button label="Nuevo" @click="router.push({ name: 'nuevo-cliente' })"></Button>
    </template>
    <div>
      <RouterView name="top" />
    </div>
    <ClientesDataTable :items="clientesStore.getAllCustomers" @click-row="on_selected"></ClientesDataTable>

    <RouterView name="bottom" />
  </Panel>
</template>
<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useClientesStore } from '@/store/clientes';
  
  import Panel from "../../components/common/PanelComponent.vue";
  import Button from '@/components/forms/InputButton.vue'
  import ClientesDataTable from '@/components/ClientesDataTable.vue'
  
  const router = useRouter()
  const clientesStore = useClientesStore()
  onMounted(() => {
    clientesStore.fetchCustomers()
  })

  function on_selected(item){
    router.push({name: 'detalle-cliente', params: {id: item.CustomerId}})
  }

</script>
