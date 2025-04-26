<template>
  <h1>ArtistsView</h1>
  <SimpleTable :columns="columns" :data="data" :isReadonly="false" />
  <ListOfLinks :links="[
    { title: 'Artists 1', path: '/catalogos/artists', id: '1' },
    { title: 'Artists 2', path: '/catalogos/artists', id: '2' },
    { title: 'Artists 3', path: '/catalogos/artists', id: '3' },
  ]" />


  <div>
    <pre>{{ data }}</pre>
  </div>
</template>
<script setup>
import { ref } from "vue";
import SimpleTable from "../../components/SimpleTable.vue";
import ListOfLinks from "@/components/common/ListOfItems.vue";
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
