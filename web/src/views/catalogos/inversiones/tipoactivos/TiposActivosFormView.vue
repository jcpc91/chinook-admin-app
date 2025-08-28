<template>

<form @submit.prevent="on_submit" class="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Código:" name="codigo" class="lg:w-2xs" />
        <InputText name="codigo" v-model="form.codigo" required class="basis-full" />
      </div>

      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Categoría Principal:" name="categoria_principal" class="lg:w-2xs" />
        <CategoriasDropDown name="categoria_principal" v-model="form.categoria_principal" required class="basis-full" />
        
      </div>

      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Subcategoría:" name="subcategoria" class="lg:w-2xs" />
        <select
          name="subcategoria"
          v-model="form.subcategoria"
          class="border border-gray-300 rounded-md px-3 py-2 w-full"
          required
          :disabled="!form.categoria_principal"
        >
          <option value="">Seleccione una subcategoría</option>
          <option v-for="(subcategoria, index) in subcategoriasDisponibles" :key="index" :value="subcategoria">
            {{ subcategoria }}
          </option>
        </select>
      </div>

      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Horizonte de Inversión:" name="horizonte_inversion" class="lg:w-2xs" />
        <select
          name="horizonte_inversion"
          v-model="form.horizonte_inversion"
          class="border border-gray-300 rounded-md px-3 py-2 w-full"
          required
        >
          <option value="">Seleccione un horizonte</option>
          <option value="Corto Plazo">Corto Plazo</option>
          <option value="Mediano Plazo">Mediano Plazo</option>
          <option value="Largo Plazo">Largo Plazo</option>
        </select>
      </div>

      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Nivel de Riesgo:" name="nivel_riesgo" class="lg:w-2xs" />
        <InputSelect name="nivel_riesgo" v-model="form.nivel_riesgo"
        :options="[{ value: 'Bajo', label: 'Bajo' }, { value: 'Medio-Bajo', label: 'Medio-Bajo' }, { value: 'Medio', label: 'Medio' }, { value: 'Medio-Alto', label: 'Medio-Alto' }, { value: 'Alto', label: 'Alto' }, { value: 'Muy Alto', label: 'Muy Alto' }]"
        required class="basis-full" />

      </div>

      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Liquidez:" name="liquidez" class="lg:w-2xs" />
        <InputSelect name="liquidez" v-model="form.liquidez"
        :options="[{ value: 'Baja', label: 'Baja' }, { value: 'Media', label: 'Media' }, { value: 'Alta', label: 'Alta' }]"
        required class="basis-full" />

      </div>

      <div class="col-span-1 lg:col-span-2">
        <div class="flex justify-end">
          <Button label="Guardar" type="submit" class="mt-4" />
          <Button label="Cancelar" type="button" class="mt-4 ml-2" @click="router.back()" />
        </div>
      </div>
    </form>
</template>
<script setup>
import { ref } from 'vue';
import InputSelect from '@/components/forms/InputSelect.vue'
import Button from '@/components/forms/InputButton.vue'
import Label from "@/components/forms/EtiquetaLabel.vue";
import InputText from '@/components/forms/InputText.vue'
import CategoriasDropDown from '@/components/forms/CategoriaDropDown.vue'
import { useRouter, useRoute } from 'vue-router';
import { useTipoActivosStore } from '@/stores/tiposActivos';

const store = useTipoActivosStore()
const router = useRouter();
const route = useRoute();
const form = ref({});

async function on_submit() {
    if (route.meta.mode == 'create') {

        store.addItem(form.value)
        await router.push({name: 'inversiones-tiposactivos-detalle', params: { codigo: form.value.codigo }})

    } else if (route.meta.mode == 'edit') {

        store.updateItem(form.value)
        await router.back()
    }
}

</script>
