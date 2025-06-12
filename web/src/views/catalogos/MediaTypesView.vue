<template>
  <ListOfItems title="Media types" :links="store.items" :onAdd="store.addItem" :onUpdate="store.updateItem" :onDelete="store.deleteItem">
  </ListOfItems>
  
</template>
<script setup>
  import { onMounted } from "vue";
  import ListOfItems from "@/components/common/ListOfItems.vue";
  import { useMediaTypeStore } from "@/store/mediaTypes";

  const store = useMediaTypeStore();

  store.$subscribe((mutation, state) =>{
    console.log(mutation, state)
    switch (mutation.events.type) {
      case "add":
        console.log(">>add");
        break;
      case "delete":
        console.log(">>delete");
        break;
    }
  })
  onMounted(() =>{
    store.fetch()
  })

</script>
