<template>
  <ListOfItems title="Generos" :links="store.items" :onAdd="store.addItem" :onUpdate="store.updateItem" :onDelete="store.deleteItem">
  </ListOfItems>
  <pre>{{ store.Generos }}</pre>
</template>
<script setup>
  import { onMounted } from "vue";
  import ListOfItems from "@/components/common/ListOfItems.vue";
  import { useGenerosStore } from "@/store/generos";
  
  const store = useGenerosStore();

  onMounted(() =>{
    store.fetch()
  })

</script>
