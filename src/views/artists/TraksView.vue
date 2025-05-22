<template>

  <div class="bg-white rounded-xl shadow-lg px-6 py-4 w-full">


    <div class="lg:flex lg:flex-row gap-3 mb-3">
      <span class="text-gray-700 font-bold text-2xl">Artista: </span>
      <div class="text-2xl">{{ artistItem.title }}</div>
    </div>
    <div class="lg:flex lg:flex-row gap-3 mb-3">
      <span class="text-gray-700 font-bold text-xl">Album:</span>
      <div class="text-xl">{{ albumItem.title }}</div>
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
      <div class="flex">
        <InputButton type="submit" label="Aceptar" />
      </div>
    </form>

    <div>
      <pre>{{ albumItem }}</pre>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useAlbunesStore } from "@/store/albunes";
import { useartistsStore } from "@/store/artists";
import { computed } from "vue";
import InputButton from "@/components/forms/InputButton.vue";
import GeneroDropDown from "@/components/forms/GenerosDropDown.vue";
import MediaTypeDropDown from "@/components/forms/MediaTypeDropDown.vue";
import InputText from "@/components/forms/InputText.vue";
import Label from "@/components/forms/EtiquetaLabel.vue";

const artistsStore = useartistsStore();
const albunesStore = useAlbunesStore();
const route = useRoute();
const track = ref({})
const artistItem = computed(() => artistsStore.getItems.find((item) => item.id == route.params.id));
const albumItem = computed(() => albunesStore.getItems.find((item) => item.id == route.params.idalbum));
//const nTracks = computed(() => albumItem.value.tracks.length)
function on_submit() {
  albumItem.value.tracks.push(track.value);
  track.value = {};
}
</script>
