<template>

  <ListOfItems title="Media types" :links="store.items" :onAdd="store.addItem" :onUpdate="store.updateItem"
    :onDelete="store.deleteItem">
  </ListOfItems>
  <pre>{{ store.items }}</pre>
</template>
<script setup>
import ListOfItems from "@/components/common/ListOfItems.vue";
import { useMediaTypeStore } from "@/store/mediaTypes";

const store = useMediaTypeStore();

</script>
