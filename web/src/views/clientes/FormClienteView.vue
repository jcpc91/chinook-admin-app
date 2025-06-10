<template>
  <Panel :title="isEditMode ? 'Editar Cliente' : 'Nuevo Cliente'">
    <form @submit.prevent="on_submit" class="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <!-- FirstName -->
      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Nombre:" name="FirstName" class="lg:w-2xs" />
        <InputText name="FirstName" v-model="form.FirstName" required class="basis-full" />
      </div>

      <!-- LastName -->
      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Apellido:" name="LastName" class="lg:w-2xs" />
        <InputText name="LastName" v-model="form.LastName" required class="basis-full" />
      </div>

      <!-- Company -->
      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Compañía:" name="Company" class="lg:w-2xs" />
        <InputText name="Company" v-model="form.Company" class="basis-full" />
      </div>

      <!-- Address -->
      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Dirección:" name="Address" class="lg:w-2xs" />
        <InputText name="Address" v-model="form.Address" class="basis-full" />
      </div>

      <!-- City -->
      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Ciudad:" name="City" class="lg:w-2xs" />
        <InputText name="City" v-model="form.City" class="basis-full" />
      </div>

      <!-- State -->
      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Estado/Provincia:" name="State" class="lg:w-2xs" />
        <InputText name="State" v-model="form.State" class="basis-full" />
      </div>

      <!-- Country -->
      <div class="lg:flex lg:flex-row gap-3">
        <Label label="País:" name="Country" class="lg:w-2xs" />
        <InputText name="Country" v-model="form.Country" class="basis-full" />
      </div>

      <!-- PostalCode -->
      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Código Postal:" name="PostalCode" class="lg:w-2xs" />
        <InputText name="PostalCode" v-model="form.PostalCode" class="basis-full" />
      </div>

      <!-- Phone -->
      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Teléfono:" name="Phone" class="lg:w-2xs" />
        <InputText name="Phone" v-model="form.Phone" class="basis-full" />
      </div>

      <!-- Fax -->
      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Fax:" name="Fax" class="lg:w-2xs" />
        <InputText name="Fax" v-model="form.Fax" class="basis-full" />
      </div>

      <!-- Email -->
      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Email:" name="Email" class="lg:w-2xs" />
        <InputText name="Email" v-model="form.Email" type="email" required class="basis-full" />
      </div>

      <!-- SupportRepId -->
      <div class="lg:flex lg:flex-row gap-3">
        <Label label="Representante de Soporte:" name="SupportRepId" class="lg:w-2xs" />
        <InputSelect
          name="SupportRepId"
          v-model="form.SupportRepId"
          :options="supportRepOptions"
          placeholder="Seleccione un representante"
          class="basis-full"
        />
        <!-- <InputText name="SupportRepId" v-model.number="form.SupportRepId" type="number" class="basis-full" /> -->
      </div>

      <!-- Buttons -->
      <div class="col-span-1 lg:col-span-2">
        <div class="flex justify-end">
          <Button :label="isEditMode ? 'Actualizar' : 'Guardar'" type="submit" class="mt-4" />
          <Button label="Cancelar" type="button" class="mt-4 ml-2" @click="cancelForm" />
        </div>
      </div>
    </form>
    <!-- <div class="mt-4 p-4 border rounded bg-gray-50">
      <h3 class="font-semibold text-lg mb-2">Form Data (Debug):</h3>
      <pre>{{ form }}</pre>
    </div> -->
  </Panel>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useClientesStore } from '@/store/clientes'; // Corrected path

import Panel from '@/components/common/PanelComponent.vue';
import Button from '@/components/forms/InputButton.vue';
import Label from "@/components/forms/EtiquetaLabel.vue";
import InputText from '@/components/forms/InputText.vue';
import InputSelect from '@/components/forms/InputSelect.vue';

const clientesStore = useClientesStore();
const router = useRouter();
const route = useRoute();

const defaultForm = {
  FirstName: '',
  LastName: '',
  Company: '',
  Address: '',
  City: '',
  State: '',
  Country: '',
  PostalCode: '',
  Phone: '',
  Fax: '',
  Email: '',
  SupportRepId: null, // Default to null for the select
};

const form = ref({ ...defaultForm });

  
const supportRepOptions = ref([
  { value: 1, label: 'Nancy Davolio (Rep ID: 1)' }, 
  { value: 2, label: 'Andrew Fuller (Rep ID: 2)' },
  { value: 3, label: 'Janet Leverling (Rep ID: 3)' }  
  // Add more representatives as needed
]);

//const isEditMode = computed(() => route.name === 'editar-cliente' && route.params.id);
 const isEditMode = computed(() => route.meta.mode === 'edit');


const on_submit = async () => {
  if (isEditMode.value) {
    await clientesStore.updateCustomer({ ...form.value, CustomerId: parseInt(route.params.id) });
    router.push({ name: 'clientes' }); 
  } else {
    await clientesStore.createCustomer(form.value);
    form.value = { ...defaultForm }; 
     router.push({ name: 'clientes' }); 
  }
};

const cancelForm = () => {
  router.back();
};

onMounted(async () => {
  if (isEditMode.value) {
    const customerId = parseInt(route.params.id);
    // Ensure customers are loaded if not already
    if (clientesStore.customers.length === 0) {
        await clientesStore.fetchCustomers(); // Make sure we have customers to find from
    }
    const customerData = await clientesStore.fetchCustomer(customerId); 
    form.value = { ...customerData };
  } else {
    // For new customer, reset form to default values
    form.value = { ...defaultForm };
  }
});
</script>
