<template>
  <Panel title="Empleados">
    <template #buttons>
      <Button label="Nuevo" @click="router.push({name: 'nuevo-empleado'})"></Button>
    </template>
    <div>
      <RouterView name="top" />
    </div>
    <EmpleadosDataTable @click-row="on_clickrow"  :items="empleadoStore.getEmpleados"  />

    <RouterView name="bottom"/>
  </Panel>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router'
  import Panel from "../../components/common/PanelComponent.vue";
  import EmpleadosDataTable from '@/components/EmpleadosDataTable.vue'
  import Button from '@/components/forms/InputButton.vue'
  import { useEmpleadosStore } from '@/store/empleados'; "@/store/empleados";

  const empleadoStore = useEmpleadosStore()
  const router = useRouter()
  const itemSelected = ref(null);



  function on_clickrow(item) {
    itemSelected.value = item;
    router.push({ name: 'detalle-empleado', params: { id: item.EmployeeId } });
  }

</script>
