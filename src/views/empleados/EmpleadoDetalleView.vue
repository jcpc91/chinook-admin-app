<template>
  <div class="w-2xl mx-auto">

    <Details :headers="config.employeeHeaders" :value="employee" @edit="editEmployee"></Details>
    <div>

    </div>
    <div class="text-xs">employee:{{ employee }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router';
import config from "@/common/config";
import Details from "@/components/DetailsComponent.vue";
import { useEmpleadosStore } from '@/store/empleados';
const empleadoStore = useEmpleadosStore();
const router = useRouter();
const route = useRoute();
const employee = ref({});


const editEmployee = () => {
  router.push({ name: 'update-empleado', params: { id: employee.value.EmployeeId } });
};


onMounted(() => {
  const emp = empleadoStore.getEmpleadoById(route.params.id);
  employee.value = emp;
});

onBeforeRouteUpdate(async (to, from, next) => {
  const emp = empleadoStore.getEmpleadoById(to.params.id);
  employee.value = emp;
  next()
})

</script>

