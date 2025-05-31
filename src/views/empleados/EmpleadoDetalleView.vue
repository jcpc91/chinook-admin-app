<template>
  <div class="w-2xl mx-auto">

    <Details :headers="config.employeeHeaders" :value="employee" @edit="editEmployee"></Details>
    <div>

    </div>
    <div class="text-xs">employee:{{ employee }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import config from "@/common/config";
import Details from "@/components/DetailsComponent.vue";
import { useEmpleadosStore } from '@/store/empleados';
const empleadoStore = useEmpleadosStore();
const router = useRouter();
const route = useRoute();
const employee = ref(null);


const editEmployee = () => {
  router.push({ name: 'update-empleado', params: { id: employee.value.EmployeeId } });
};

watch(() => route.params.id, (newId) => {
  console.log("watching id", newId);
  const emp = empleadoStore.getEmpleadoById(newId);
  console.log(emp);
  employee.value = emp;
}, { immediate: true });

onMounted(() => {

});
</script>

