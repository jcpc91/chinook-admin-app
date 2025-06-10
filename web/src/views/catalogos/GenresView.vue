<template>
  <ListOfItems title="Generos" :links="store.Generos" :onAdd="store.addGenero" :onUpdate="store.updateGenero"
    :onDelete="store.deleteGenero">
  </ListOfItems>
  <pre>{{ store.Generos }}</pre>
</template>
<script setup>
import ListOfItems from "@/components/common/ListOfItems.vue";
import { useCatalogosStore } from "@/store/catalogos";

const store = useCatalogosStore();

</script>
