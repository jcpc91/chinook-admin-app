<template>
  <h1>ArtistsView</h1>
  <SimpleTable :columns="columns" :data="data" :isReadonly="false" />
  <div>
    <pre>{{ data }}</pre>
  </div>
</template>
<script setup>
import { ref } from "vue";
import SimpleTable from "../../components/SimpleTable.vue";
const columns = [
  {

    label: "Nombre",
    field: "name",
    sortable: true
  }
]
const data = ref([
  {
    name: "John Doe"
  },
  {
    name: "Jane Doe"
  }
])
</script>
