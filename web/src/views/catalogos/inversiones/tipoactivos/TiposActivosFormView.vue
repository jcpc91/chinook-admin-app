<template>

    <form @submit.prevent="on_submit"  class="grid grid-cols-1 lg:grid-cols-3 gap-3">
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
         <InputSelect name="nivelriesgo" v-model="form.nivelriesgo" required class="basis-full" />

      </div>
      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Horizonte de Inversión" name="horizonteinversion" class="lg:w-2xs" />
        <!-- Horizonte de Inversión -->
         <InputSelect name="horizonteinversion" v-model="form.horizonteinversion" required class="basis-full" />

      </div>
      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Liquidez" name="liquidez" class="lg:w-2xs" />
        <!-- Liquidez -->
         <InputSelect name="liquidez" v-model="form.liquidez" required class="basis-full" />

      </div>
      <div class="col-span-1 lg:col-span-3">
        <div class="flex justify-end">
          <Button label="Guardar" type="submit" class="mt-4" />
          <Button label="Cancelar" type="button" class="mt-4 ml-2" @click="router.back()" />
        </div>
      </div>
      <div>
        {{ form }}
      </div>
    </form>
</template>
<script setup>
import { ref } from 'vue';
import InputSelect from '@/components/forms/InputSelect.vue'
import Button from '@/components/forms/InputButton.vue'
import Label from "@/components/forms/EtiquetaLabel.vue";
import InputText from '@/components/forms/InputText.vue'
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const form = ref({});

async function on_submit() {
    if (route.meta.type == 'insert') {
        console.log('Formulario enviado:', form.value);
        await router.back()

    } else if (route.meta.type == 'update') {
        console.log('Formulario enviado:', form.value);
        await router.back()
    }
}

</script>
