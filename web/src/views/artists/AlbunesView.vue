<template>

  <ListOfLinks :links="albunesStore.getItems" :title="`Albunes de ${artist?.title}`" :onAdd="on_add"
    :onUpdate="albunesStore.updateItem" :on-delete="albunesStore.deleteItem">
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
import { onMounted, ref } from "vue";
import ListOfLinks from "@/components/common/ListOfItems.vue";

const albunesStore = useAlbunesStore();
const artistsStore = useartistsStore();

const router = useRouter()
const route = useRoute();
const artist = ref()


onMounted(async () => {

  artist.value = await artistsStore.getItem(route.params.id)
  await albunesStore.fetchItemsByArtistId(route.params.id)
})

async function on_add(item) {
  item.artistid = route.params.id
  await albunesStore.addItem(item)
}
</script>
