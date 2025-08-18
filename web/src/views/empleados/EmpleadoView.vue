<template>
  <Panel title="Empleados">
    <template #buttons>
      <Button label="Nuevo" @click="router.push({name: 'nuevo-empleado'})"></Button>
    </template>
    <div>
      <RouterView name="top" />
    </div>
    <EmpleadosDataTable @click-row="on_clickrow"  :items="empleadoStore.empleados"  />

    <RouterView name="bottom"/>
  </Panel>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { reactify, useAsyncState } from '@vueuse/core'
    import Panel from "../../components/common/PanelComponent.vue";
    import Button from '@/components/forms/InputButton.vue'
    import EmpleadosDataTable from '@/components/EmpleadosDataTable.vue'
    import { useRouter } from 'vue-router'
    import { useEmpleadosStore } from '@/store/empleados';

    const empleadoStore = useEmpleadosStore()
    const router = useRouter()
    const state = useAsyncState(async(args) => {
        if (empleadoStore.empleados.length)
            return empleadoStore.empleados
        return await empleadoStore.fetchEmpleados()

    }, [], {immediate: false})



    function on_clickrow(item) {
    router.push({ name: 'detalle-empleado', params: { id: item.id } });
    }

    onMounted(async () => {
        await state.execute()
    })


</script>
