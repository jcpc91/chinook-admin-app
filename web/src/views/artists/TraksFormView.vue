<template>
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
</template>
<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import InputButton from "@/components/forms/InputButton.vue";
import GeneroDropDown from "@/components/forms/GenerosDropDown.vue";
import MediaTypeDropDown from "@/components/forms/MediaTypeDropDown.vue";
import InputText from "@/components/forms/InputText.vue";
import Label from "@/components/forms/EtiquetaLabel.vue";
import { useTraksStore } from "@/store/traks";

const route = useRoute();
const traksStore = useTraksStore();

const track = ref({
    albumId: route.params.idalbum,
  })

async function on_submit() {
    if (route.meta.type == 'insert') {
        await traksStore.createTrak(track.value)
        track.value = {};
    }
}
</script>
