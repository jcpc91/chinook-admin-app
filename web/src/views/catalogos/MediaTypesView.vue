<template>

  <ListOfItems title="Media types" :links="store.items" :onAdd="store.addItem" :onUpdate="store.updateItem"
    :onDelete="store.deleteItem">
  </ListOfItems>
  
</template>
<script setup>
  import { onMounted } from "vue";
  import ListOfItems from "@/components/common/ListOfItems.vue";
  import { useMediaTypeStore } from "@/store/mediaTypes";

  const store = useMediaTypeStore();

  onMounted(() =>{
    store.fetch()
  })

</script>
