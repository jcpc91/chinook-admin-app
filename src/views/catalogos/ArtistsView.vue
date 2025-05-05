<template>

  <ListOfLinks title="Artistas" :links="store.items" :fetch="store.fetchItems" :on-add="store.addItem"
    :on-update="store.updateItem" :on-delete="store.deleteItem" />


  <div>
    <pre>{{ store.items }}</pre>
  </div>
</template>
<script setup>
import { onMounted } from "vue";
import ListOfLinks from "@/components/common/ListOfItems.vue";
import { useartistsStore } from "@/store/artists";

const store = useartistsStore();

onMounted(async () => {
  console.log('onmounted');

})
</script>
