<template>
  <div class="bg-white rounded-xl shadow-lg px-6 py-4 w-full">


    <div class="lg:flex lg:flex-row gap-3 mb-3">
      <span class="text-gray-700 font-bold text-2xl">Artista: </span>
      <div class="text-2xl">{{ artistname(artisState.state) }}</div>
    </div>
    <div class="lg:flex lg:flex-row gap-3 mb-3">
      <span class="text-gray-700 font-bold text-xl">Album:</span>
      <div class="text-xl">{{ albumItem?.title }}</div>
    </div>

    <div class="flex justify-end">
      <InputButton @click="router.push({name: 'nuevo-track'})" type="button" label="Agregar" />
    </div>

    <div >
      <TracksDataTable :items="traksStore.getTraks"></TracksDataTable>
    </div>
    <div>
        <RouterView></RouterView>
    </div>
  </div>
</template>
<script setup>
  import {  onMounted } from "vue";
  import InputButton from "@/components/forms/InputButton.vue";
  import { useRoute, useRouter, onBeforeRouteUpdate } from "vue-router";
  import { useAsyncState, reactify } from '@vueuse/core'
  import { useAlbunesStore } from "@/store/albunes";
  import { useartistsStore } from "@/store/artists";
  import { useTraksStore } from "@/store/traks";
  import { computed } from "vue";

  import TracksDataTable from "@/components/TracksDataTable.vue";

  const artistsStore = useartistsStore();
  const albunesStore = useAlbunesStore();
  const traksStore = useTraksStore();
  const router = useRouter();
  const route = useRoute();

  const artisState = useAsyncState(artistsStore.getItem(route.params.id), {})
  const artistname = reactify((input) => input?.title)
  const albumItem = computed(() => albunesStore.getItems.find((item) => item.id == route.params.idalbum));
  onMounted(async () =>{
    await traksStore.fetchTraks(route.params.idalbum)
  })
  onBeforeRouteUpdate(async (to) => {
    await traksStore.fetchTraks(to.params.idalbum)
  })


</script>
