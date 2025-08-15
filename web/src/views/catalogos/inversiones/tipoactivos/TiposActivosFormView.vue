<template>
  <div>
    <form class="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Código" name="codigo" class="lg:w-2xs" />
        <!-- Código -->
        <InputText name="codigo" v-model="form.codigo" required class="basis-full" />
      </div>
      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Categoría" name="categoria" class="lg:w-2xs" />
        <!-- Categoría -->
        <InputText name="categoria" v-model="form.categoria" required class="basis-full" />
      </div>
      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Subcategoría" name="subcategoria" class="lg:w-2xs" />
        <!-- Subcategoría -->
        <InputText name="subcategoria" v-model="form.subcategoria" required class="basis-full" />
      </div>
      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Nivel de Riesgo" name="nivelriesgo" class="lg:w-2xs" />
        <!-- Nivel de Riesgo -->
        <InputText name="nivelriesgo" v-model="form.nivelriesgo" required class="basis-full" />
      </div>
      <div class="col-span-1 lg:col-span-2">
        <div class="flex justify-end">
          <Button label="Guardar" type="submit" class="mt-4" />
          <Button label="Cancelar" type="button" class="mt-4 ml-2" @click="router.back()" />
        </div>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import Panel from '@/components/common/PanelComponent.vue'
import Button from '@/components/forms/InputButton.vue'
import Label from "@/components/forms/EtiquetaLabel.vue";
import InputText from '@/components/forms/InputText.vue'
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const form = ref({ codigo: "1", categoria: "Acciones", subcategoria: "Acciones Ordinarias", nivelriesgo: "Alto", horizonteinversion: "Largo Plazo", liquidez: "Baja" });
  function on_submit() {
    
  }
</script>