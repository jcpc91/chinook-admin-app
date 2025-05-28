<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Nuevo empleado</h1>
    <form class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Apellido -->
      <InputText
        label="Apellido"
        name="LastName"
        v-model="form.LastName"
        required
      />
      <!-- Nombre -->
      <InputText
        label="Nombre"
        name="FirstName"
        v-model="form.FirstName"
        required
      />
      <!-- Título -->
      <InputText
        label="Título"
        name="Title"
        v-model="form.Title"
      />
      <!-- Reporta a -->
      <InputSelect
        label="Reporta a"
        name="ReportsTo"
        v-model="form.ReportsTo"
        :options="reportsToOptions"
        placeholder="Seleccione un supervisor"
      />
      <!-- Fecha de nacimiento -->
      <InputText
        label="Fecha de nacimiento"
        name="BirthDate"
        v-model="form.BirthDate"
        type="date"
      />
      <!-- Fecha de contratación -->
      <InputText
        label="Fecha de contratación"
        name="HireDate"
        v-model="form.HireDate"
        type="date"
      />
      <!-- Dirección -->
      <InputText
        label="Dirección"
        name="Address"
        v-model="form.Address"
      />
      <!-- Ciudad -->
      <InputText
        label="Ciudad"
        name="City"
        v-model="form.City"
      />
      <!-- Estado -->
      <InputText
        label="Estado"
        name="State"
        v-model="form.State"
      />
      <!-- País -->
      <InputText
        label="País"
        name="Country"
        v-model="form.Country"
      />
      <!-- Código postal -->
      <InputText
        label="Código postal"
        name="PostalCode"
        v-model="form.PostalCode"
      />
      <!-- Teléfono -->
      <InputText
        label="Teléfono"
        name="Phone"
        v-model="form.Phone"
      />
      <!-- Fax -->
      <InputText
        label="Fax"
        name="Fax"
        v-model="form.Fax"
      />
      <!-- Email -->
      <InputText
        label="Email"
        name="Email"
        v-model="form.Email"
        type="email"
      />
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import InputText from '@/components/forms/InputText.vue'
import InputSelect from '@/components/forms/InputSelect.vue'

const form = ref({
  LastName: '',
  FirstName: '',
  Title: '',
  ReportsTo: null,
  BirthDate: '',
  HireDate: '',
  Address: '',
  City: '',
  State: '',
  Country: '',
  PostalCode: '',
  Phone: '',
  Fax: '',
  Email: '',
})

// Opciones de ejemplo para el select de ReportsTo
const reportsToOptions = [
  { value: 1, label: 'Supervisor 1' },
  { value: 2, label: 'Supervisor 2' },
  // ...agrega más opciones según tus datos
]
</script>
