<template>

  <ListOfLinks :links="albunes" :title="'Albunes ' + artist ? artist.title : ''" :onAdd="on_add"
    :onUpdate="albunesStore.updateItem" >
    <template #buttons="{item}">
    <button @click="router.push({ name: 'tracks-albun', params: { idalbum: item.id } })"
        class="text-teal-600 font-bold">💽</button>
    </template>
  </ListOfLinks>
  <div class="p-3">
    <RouterView />
  </div>
</template>
<script setup>
import { useRoute, useRouter } from "vue-router";
import { useAlbunesStore } from "@/store/albunes";
import { useartistsStore } from "@/store/artists";
import { computed } from "vue";
import ListOfLinks from "@/components/common/ListOfItems.vue";

const albunesStore = useAlbunesStore();
const artistsStore = useartistsStore();

const router = useRouter()
const route = useRoute();
const artist = computed(() => artistsStore.getItems.find(f => f.id == route.params.id))
const albunes = computed(() => albunesStore.getItems.filter(f => f.artistid === route.params.id))

function on_add(item) {
  item.artistid = route.params.id
  albunesStore.addItem(item)
}
</script>
