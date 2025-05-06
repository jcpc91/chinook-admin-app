<template>

  <ListOfLinks :links="albunesStore.getItems" :title="'Albunes ' + artist ? artist.title : ''" :onAdd="on_add"
    :onUpdate="albunesStore.updateItem" />
  <div>
    {{ albunesStore.items }}
  </div>
</template>
<script setup>
import { useRoute } from "vue-router";
import { useAlbunesStore } from "@/store/albunes";
import { useartistsStore } from "@/store/artists";
import { computed } from "vue";
import ListOfLinks from "@/components/common/ListOfItems.vue";

const albunesStore = useAlbunesStore();
const artistsStore = useartistsStore();

const route = useRoute();
const artist = computed(() => artistsStore.getItems.find(f => f.id == route.params.id))

function on_add(item) {
  item.artistid = route.params.id
  albunesStore.addItem(item)
}
</script>
