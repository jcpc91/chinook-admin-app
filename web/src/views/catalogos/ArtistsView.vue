<template>
  <h6>artistas</h6>
  <ListOfLinks title="Artistas" :links="store.items" :fetch="store.fetchItems" :on-add="store.addItem"
    :on-update="store.updateItem" :on-delete="store.deleteItem">
    <template #buttons="{ _, item }">
      <button @click="router.push({ name: 'albunes-artist', params: { idartist: item.id } })"
        class="text-teal-600 font-bold">🎵</button>

    </template>
  </ListOfLinks>

</template>
<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import ListOfLinks from "@/components/common/ListOfItems.vue";
import { useartistsStore } from "@/store/artists";

const store = useartistsStore();
const router = useRouter();



onMounted(async () => {
  await store.fetchItems()

})
</script>
