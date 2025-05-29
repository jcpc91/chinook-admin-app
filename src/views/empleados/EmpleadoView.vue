<template>
  <Panel title="Empleados">
    <template #buttons>
      <Button label="Nuevo" @click="router.push({name: 'nuevo-empleado'})"></Button>
    </template>
    <div>
      <RouterView name="formulario" />
    </div>
    <DataTable v-model="itemSelected" :headers="headers" :items="items" />
    <div>item:{{ itemSelected }}</div>
  </Panel>
  <RouterView name="default"/>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router'
  import Panel from "../../components/common/PanelComponent.vue";
  import DataTable from '@/components/DataTable.vue'
  import Button from '@/components/forms/InputButton.vue'

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

  const items = [
    { EmployeeId: 1, LastName: "Davolio", FirstName: "Nancy", Title: "Sales Representative", ReportsTo: 2, BirthDate: "1948-12-08", HireDate: "1992-05-01", Address: "507 - 20th Ave. E.\nApt. 2A", City: "Seattle", State: "WA", Country: "USA", PostalCode: "98122", Phone: "(206) 555-9857", Fax: null, Email: "nancy@northwindtraders.com" },
    { EmployeeId: 2, LastName: "Fuller", FirstName: "Andrew", Title: "Vice President, Sales", ReportsTo: null, BirthDate: "1952-02-19", HireDate: "1992-08-14", Address: "908 W. Capital Way", City: "Tacoma", State: "WA", Country: "USA", PostalCode: "98401", Phone: "(206) 555-9482", Fax: null, Email: "andrew@northwindtraders.com" },
    { EmployeeId: 3, LastName: "Leverling", FirstName: "Janet", Title: "Sales Representative", ReportsTo: 2, BirthDate: "1963-08-30", HireDate: "1992-04-01", Address: "722 Moss Bay Blvd.", City: "Kirkland", State: "WA", Country: "USA", PostalCode: "98033", Phone: "(206) 555-3412", Fax: null, Email: "janet@northwindtraders.com" }
  ];


</script>
