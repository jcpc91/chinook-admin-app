<template>
  <Panel title="Empleados">
    <template #buttons>
      <Button label="Nuevo" @click="router.push({name: 'nuevo-empleado'})"></Button>
    </template>
    <div>
      <RouterView name="top" />
    </div>
    <DataTable v-model="itemSelected" :headers="headers" :items="empleadoStore.getEmpleados" />
    <div>item:{{ itemSelected }}</div>
  </Panel>
  <RouterView name="bottom"/>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router'
  import Panel from "../../components/common/PanelComponent.vue";
  import DataTable from '@/components/DataTable.vue'
  import Button from '@/components/forms/InputButton.vue'
  import { useEmpleadosStore } from '@/store/empleados'; "@/store/empleados";

  const empleadoStore = useEmpleadosStore()
  const router = useRouter()
  const itemSelected = ref(null);

  const headers = [
    { text: "Apellido", value: "LastName" },
    { text: "Nombre", value: "FirstName" },
    { text: "Título", value: "Title" },
    { text: "Reporta a", value: "ReportsTo" },
    { text: "Nacimiento", value: "BirthDate" },
    { text: "Contratación", value: "HireDate" },
    { text: "Ciudad", value: "City" },
    { text: "Estado", value: "State" },
    { text: "País", value: "Country" },
    { text: "Código Postal", value: "PostalCode" },
    { text: "Teléfono", value: "Phone" },
    { text: "Email", value: "Email" }
  ];



</script>
