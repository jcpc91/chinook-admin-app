<template>

  <ListOfLinks title="Artistas" :links="store.items" :fetch="store.fetchItems" :on-add="store.addItem"
    :on-update="store.updateItem" :on-delete="store.deleteItem">
    <template #buttons="{ index, item }">
      <button @click="router.push({ name: 'albunes-artist', params: { id: item.id } })"
        class="text-teal-600 font-bold">🎵({{ index }})</button>

    </template>
  </ListOfLinks>


  <div>
    <pre>{{ store.items }}</pre>
  </div>
</template>
<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import ListOfLinks from "@/components/common/ListOfItems.vue";
import { useartistsStore } from "@/store/artists";

const store = useartistsStore();
const router = useRouter();



onMounted(async () => {
  console.log('onmounted');

})
</script>
