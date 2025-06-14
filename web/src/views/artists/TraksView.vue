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

    <form @submit.prevent="on_submit">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 p-3">
        <div class="lg:flex lg:flex-row gap-3">
          <Label label="Nombre del track" name="nombre" class="lg:w-2xs"></Label>
          <InputText v-model="track.nombre" name="nombre" class="basis-full"></InputText>
        </div>
        <div class="lg:flex lg:flex-row gap-3">
          <Label label="Compositores:" name="composer" class="lg:w-2xs"></Label>
          <InputText v-model="track.compositores" name="composer" class="basis-full"></InputText>
        </div>
        <div class="lg:flex lg:flex-row gap-3">
          <Label label="Media type:" name="mediaType" class="lg:w-2xs"></Label>
          <MediaTypeDropDown v-model="track.mediatype" class="basis-full" />
        </div>
        <div class="lg:flex lg:flex-row gap-3">
          <Label label="Generos:" name="generos" class="lg:w-2xs"></Label>
          <GeneroDropDown v-model="track.genero" class="basis-full"></GeneroDropDown>
        </div>
        <div class="lg:flex lg:flex-row gap-3">
          <Label label="Precio unitario:" name="nombre" class="lg:w-2xs"></Label>
          <InputText v-model="track.precio" name="nombre" class="basis-full"></InputText>
        </div>
      </div>
      <div class="flex justify-end">
        <InputButton type="submit" label="Aceptar" />
      </div>
    </form>

    <div class="flex">
      <pre>traks: {{ traksStore.getTraks }}</pre>
    </div>
  </div>
</template>
<script setup>
  import { ref, onMounted } from "vue";
  import { useRoute, onBeforeRouteUpdate } from "vue-router";
  import { useAsyncState, reactify } from '@vueuse/core'
  import { useAlbunesStore } from "@/store/albunes";
  import { useartistsStore } from "@/store/artists";
  import { useTraksStore } from "@/store/traks";
  import { computed } from "vue";
  import InputButton from "@/components/forms/InputButton.vue";
  import GeneroDropDown from "@/components/forms/GenerosDropDown.vue";
  import MediaTypeDropDown from "@/components/forms/MediaTypeDropDown.vue";
  import InputText from "@/components/forms/InputText.vue";
  import Label from "@/components/forms/EtiquetaLabel.vue";
  
  const artistsStore = useartistsStore();
  const albunesStore = useAlbunesStore();
  const traksStore = useTraksStore();
  const route = useRoute();
  const track = ref({
    albumId: route.params.idalbum,
  })
  const artisState = useAsyncState(artistsStore.getItem(route.params.id), {})
  const artistname = reactify((input) => input?.title)
  const albumItem = computed(() => albunesStore.getItems.find((item) => item.id == route.params.idalbum));
  onMounted(async () =>{
    await traksStore.fetchTraks(route.params.idalbum)
  })
  onBeforeRouteUpdate(async (to, from) => {
    await traksStore.fetchTraks(to.params.idalbum)
  })
  
  function on_submit() {
    traksStore.createTrak(track.value)
    track.value = {};
  }
</script>
