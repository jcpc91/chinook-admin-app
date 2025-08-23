<template>
  <Panel title="Nuevo Activo">
    <form @submit.prevent="on_submit" class="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Código:" name="codigo" class="lg:w-2xs" />
        <InputText name="codigo" v-model="form.codigo" required class="basis-full" />
      </div>
      
      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Categoría Principal:" name="categoria_principal" class="lg:w-2xs" />
        <select 
          name="categoria_principal" 
          v-model="form.categoria_principal" 
          class="border border-gray-300 rounded-md px-3 py-2 w-full"
          required
          @change="updateSubcategorias"
        >
          <option value="">Seleccione una categoría</option>
          <option value="Renta Variable">Renta Variable</option>
          <option value="Renta Fija">Renta Fija</option>
          <option value="Inmuebles">Inmuebles</option>
          <option value="Materias Primas">Materias Primas</option>
        </select>
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
        <select 
          name="nivel_riesgo" 
          v-model="form.nivel_riesgo" 
          class="border border-gray-300 rounded-md px-3 py-2 w-full"
          required
        >
          <option value="">Seleccione nivel de riesgo</option>
          <option value="Bajo">Bajo</option>
          <option value="Medio-Bajo">Medio-Bajo</option>
          <option value="Medio">Medio</option>
          <option value="Medio-Alto">Medio-Alto</option>
          <option value="Alto">Alto</option>
          <option value="Muy Alto">Muy Alto</option>
        </select>
      </div>

      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Liquidez:" name="liquidez" class="lg:w-2xs" />
        <select 
          name="liquidez" 
          v-model="form.liquidez" 
          class="border border-gray-300 rounded-md px-3 py-2 w-full"
          required
        >
          <option value="">Seleccione nivel de liquidez</option>
          <option value="Baja">Baja</option>
          <option value="Media">Media</option>
          <option value="Alta">Alta</option>
        </select>
      </div>

      <div class="col-span-1 lg:col-span-2">
        <div class="flex justify-end">
          <Button label="Guardar" type="submit" class="mt-4" />
          <Button label="Cancelar" type="button" class="mt-4 ml-2" @click="router.back()" />
        </div>
      </div>
    </form>
  </Panel>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Panel from '@/components/common/PanelComponent.vue';
import Button from '@/components/forms/InputButton.vue';
import Label from "@/components/forms/EtiquetaLabel.vue";
import InputText from '@/components/forms/InputText.vue';

const router = useRouter();
const route = useRoute();

// Definir las subcategorías por categoría principal
const subcategorias = {
  'Renta Variable': [
    'Acciones individuales',
    'ETFs de acciones',
    'Fondos de inversión en acciones',
    'Private Equity / VC'
  ],
  'Renta Fija': [
    'Bonos gubernamentales',
    'Bonos corporativos',
    'Fondos de renta fija',
    'Certificados de depósito'
  ],
  'Inmuebles': [
    'Bienes raíces residenciales',
    'Bienes raíces comerciales',
    'REITs',
    'Fondos de inversión inmobiliaria'
  ],
  'Materias Primas': [
    'Oro',
    'Plata',
    'Petróleo',
    'Productos agrícolas'
  ]
};

const form = reactive({
  codigo: '',
  categoria_principal: '',
  subcategoria: '',
  horizonte_inversion: '',
  nivel_riesgo: '',
  liquidez: ''
});

const subcategoriasDisponibles = ref([]);

const updateSubcategorias = () => {
  form.subcategoria = ''; // Reset subcategoría al cambiar categoría principal
  subcategoriasDisponibles.value = subcategorias[form.categoria_principal] || [];
};

const on_submit = async () => {
  try {
    console.log('Formulario enviado:', form);
    // TODO: Implementar lógica de guardado aquí
    // Por ahora, solo regresar
    router.back();
  } catch (error) {
    console.error('Error al guardar el activo:', error);
  }
};

onMounted(() => {
  if (route.meta.type === 'update') {
    // TODO: Cargar datos existentes del activo
    // form.codigo = datosExistentes.codigo;
    // form.categoria_principal = datosExistentes.categoria_principal;
    // ...etc
  }
});
</script>

<style scoped>
/* Estilos personalizados si son necesarios */
</style>