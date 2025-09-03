<template>
  <form @submit.prevent="on_submit" class="grid grid-cols-1 lg:grid-cols-2 gap-3">
    <div class="lg:flex lg:flex-row gap-3">
      <Label label="Código:" name="codigo" class="lg:w-2xs" />
      <InputText name="codigo" v-model="form.codigo" required class="basis-full" />
    </div>

    <div class="lg:flex lg:flex-row gap-3">
      <Label label="Categoría Principal:" name="categoria_principal" class="lg:w-2xs" />
      <CategoriasDropDown name="categoria_principal" v-model="form.categoria" required class="basis-full" />

    </div>

    <div class="lg:flex lg:flex-row gap-3">
      <Label label="Subcategoría:" name="subcategoria" class="lg:w-2xs" />
      <SubCategoriasDropDown name="subcategoria" v-model="form.subcategoria" :categoria="form.categoria" required
        class="basis-full" />
    </div>

    <div class="lg:flex lg:flex-row gap-3">
      <Label label="Horizonte de Inversión:" name="horizonte_inversion" class="lg:w-2xs" />
      <DropDown name="horizonte_inversion" v-model="form.horizonteinversion"
        :options="[{ value: 'Corto Plazo', label: 'Corto Plazo' }, { value: 'Mediano Plazo', label: 'Mediano Plazo' }, { value: 'Largo Plazo', label: 'Largo Plazo' }]"
        class="basis-full" />

    </div>

    <div class="lg:flex lg:flex-row gap-3">
      <Label label="Nivel de Riesgo:" name="nivel_riesgo" class="lg:w-2xs" />
      <InputSelect name="nivel_riesgo" v-model="form.nivelriesgo"
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
    <div>{{ form }}</div>
  </form>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import InputSelect from '@/components/forms/InputSelect.vue'
import Button from '@/components/forms/InputButton.vue'
import Label from "@/components/forms/EtiquetaLabel.vue";
import InputText from '@/components/forms/InputText.vue'
import CategoriasDropDown from '@/components/forms/CategoriaDropDown.vue'
import SubCategoriasDropDown from '@/components/forms/SubCategoriasDropDown.vue'
import DropDown from "@/components/forms/InputSelect.vue"
import { useRouter, useRoute } from 'vue-router';
import { useTipoActivosStore } from '@/stores/tiposActivos';

const store = useTipoActivosStore()
const router = useRouter();
const route = useRoute();
const form = ref({});

onMounted(() => {
  if (route.meta.mode == 'edit') {
    const item = store.fetchItemById(route.params.codigo)
    form.value = { ...item }
  }
})

async function on_submit() {
  if (route.meta.mode == 'create') {

    store.addItem(form.value)
    await router.push({ name: 'inversiones-tiposactivos-detalle', params: { codigo: form.value.codigo } })

  } else if (route.meta.mode == 'edit') {

    store.updateItem(form.value)
    await router.push({ name: 'inversiones-tiposactivos-detalle', params: { codigo: form.value.codigo } })
  }
}

</script>
