<template>
  <div class="w-auto">


    <table class="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
          <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artista</th>

          <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="item in store.items" :key="item.id">
          <td class="px-3 py-2 whitespace-nowrap">{{ item.artistid }}</td>
          <td class="px-3 py-2 whitespace-nowrap">{{ item.title }}</td>


          <td class="px-3 py-2 whitespace-nowrap flex gap-1">
            <Button label="Edit" color="info"></Button>
            <Button label="Delete" color="warning"></Button>
          </td>
        </tr>

      </tbody>
      <tfoot class="bg-white divide-y divide-gray-200">
        <tr>
          <td class="px-3 py-2 whitespace-nowrap">
            <DropDownArtist v-model="artista.artistid" />
          </td>
          <td class="px-3 py-2 whitespace-nowrap">
            <InputText v-model="artista.title" name="title" label="Titulo" type="text" />
          </td>
          <td class="px-3 py-2 whitespace-nowrap">
            <Button label="Save" @click="store.addItem(artista)"></Button>
          </td>
        </tr>
      </tfoot>
    </table>
    <div>
      {{ store.items }}
    </div>
  </div>
</template>
<script setup>
import { reactive, ref } from "vue";
import DropDownArtist from "@/components/forms/ArtistsDropDown.vue";
import InputText from "@/components/forms/InputText.vue";
import Button from "@/components/forms/InputButton.vue";
import { useAlbunesStore } from "@/store/albunes";

const store = useAlbunesStore();
const artista = ref({})


</script>
