<template>
    <DropDown v-model="modelValue" label="Empleado" name="Empleado"
    :options="data"
    item-value="id"
    item-title="title"
     />


</template>
<script setup>
import { defineModel } from 'vue';
    import DropDown from "@/components/forms/InputSelect.vue";
    import { useEmpleadosStore } from "@/store/empleados";
    import { reactive, onMounted, computed } from "vue";
    import { useAsyncState } from '@vueuse/core'

    const modelValue = defineModel({required: true});
    const state = useAsyncState(async(args) => {
        if (empleadoStore.empleados.length)
            return empleadoStore.empleados
        return await empleadoStore.fetchEmpleados()

    }, [], {immediate: false})
    const empleadoStore = useEmpleadosStore()
    const data = computed(() => state.state.value.map(m => {return {id: m.id, title: m.FirstName}}))


    onMounted(async() => {

        await state.execute()
    })
</script>
