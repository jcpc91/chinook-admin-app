<template>
  <Panel title="Nuevo empleado">
      <form @submit.prevent="on_submit" class="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div class="lg:flex lg:flex-row gap-3">
          <Label label="Apellido" name="LastName" class="lg:w-2xs" />
          <!-- Apellido -->
          <InputText

            name="LastName"
            v-model="form.LastName"
            required
            class="basis-full"
          />
        </div>
        <div class="lg:flex lg:flex-row gap-3">
          <Label label="Nombre:" name="FirstName" class="lg:w-2xs" />
          <!-- Nombre -->
          <InputText

            name="FirstName"
            v-model="form.FirstName"
            required
            class="basis-full"
          />
        </div>
        <div class="lg:flex lg:flex-row gap-3">
          <Label label="Título:" name="Title" class="lg:w-2xs" />
          <!-- Título -->
          <InputText

            name="Title"
            v-model="form.Title"
            class="basis-full"
          />
        </div>
        <div class="lg:flex lg:flex-row gap-3">
          <Label label="Reporta a:" name="ReportsTo" class="lg:w-2xs" />
          <!-- Reporta a -->

          <EmployeeDropDown v-model="form.ReportsTo" class="basis-full" />
        </div>
        <div class="lg:flex lg:flex-row gap-3">
          <Label label="Fecha de nacimiento:" name="BirthDate" class="lg:w-2xs" />
          <!-- Fecha de nacimiento -->
          <InputText

            name="BirthDate"
            v-model="form.BirthDate"
            type="date"
            class="basis-full"
          />
        </div>
        <div class="lg:flex lg:flex-row gap-3">
          <Label label="Fecha de contratación:" name="HireDate" class="lg:w-2xs" />
          <!-- Fecha de contratación -->
          <InputText

            name="HireDate"
            v-model="form.HireDate"
            type="date"
            class="basis-full"
          />
        </div>
        <div class="lg:flex lg:flex-row gap-3">
          <Label label="Dirección:" name="Address" class="lg:w-2xs" />
          <!-- Dirección -->
          <InputText

            name="Address"
            v-model="form.Address"
            class="basis-full"
          />
        </div>
        <div class="lg:flex lg:flex-row gap-3">
          <Label label="Ciudad:" name="City" class="lg:w-2xs" />
        <!-- Ciudad -->
        <InputText

          name="City"
          v-model="form.City"
          class="basis-full"
        />
          </div>
          <div class="lg:flex lg:flex-row gap-3">
            <Label label="Estado:" name="State" class="lg:w-2xs" />
        <!-- Estado -->
        <InputText

          name="State"
          v-model="form.State"
          class="basis-full"
        />
          </div>
          <div class="lg:flex lg:flex-row gap-3">
            <Label label="País:" name="Country" class="lg:w-2xs" />
        <!-- País -->
        <InputText

          name="Country"
          v-model="form.Country"
          class="basis-full"
        />
          </div>
        <div class="lg:flex lg:flex-row gap-3">
          <Label label="Código postal:" name="PostalCode" class="lg:w-2xs" />
        <!-- Código postal -->
        <InputText

          name="PostalCode"
          v-model="form.PostalCode"
          class="basis-full"
        />
        </div>
        <div class="lg:flex lg:flex-row gap-3">
          <Label label="Teléfono:" name="Phone" class="lg:w-2xs" />
        <!-- Teléfono -->
        <InputText

          name="Phone"
          v-model="form.Phone"
          class="basis-full"
        />
        </div>
        <div class="lg:flex lg:flex-row gap-3">
          <Label label="Fax:" name="Fax" class="lg:w-2xs" />
        <!-- Fax -->
        <InputText

          name="Fax"
          v-model="form.Fax"
          class="basis-full"
        />
          </div>
          <div class="lg:flex lg:flex-row gap-3">
            <Label label="Email:" name="Email" class="lg:w-2xs" />
        <!-- Email -->
        <InputText

          name="Email"
          v-model="form.Email"
          type="email"
          class="basis-full"
        />
          </div>
        <div class="col-span-1 lg:col-span-2">
          <div class="flex justify-end">
            <Button label="Guardar" type="submit" class="mt-4" />
            <Button label="Cancelar" type="button" class="mt-4 ml-2" @click="router.back()" />
          </div>
        </div>
      </form>
      <div>{{ error }}</div>
    <div>{{form}}</div>
  </Panel>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import Panel from '@/components/common/PanelComponent.vue'
  import Button from '@/components/forms/InputButton.vue'
  import Label from "@/components/forms/EtiquetaLabel.vue";
  import InputText from '@/components/forms/InputText.vue'
  import InputSelect from '@/components/forms/InputSelect.vue'
  import EmployeeDropDown from "@/components/forms/EmployeeDropDown.vue";
  import { useRouter, useRoute } from 'vue-router';
  import { useEmpleadosStore } from "@/store/empleados";

  const error = ref(null)
  const empleadosStore = useEmpleadosStore()
  const router = useRouter();
  const route = useRoute();

  const defaultform = {
    LastName: '',
    FirstName: '',
    Title: '',
    ReportsTo: '1',
    BirthDate: '2025-07-04',
    HireDate: '2025-07-04',
    Address: '',
    City: '',
    State: '',
    Country: '',
    PostalCode: '',
    Phone: '',
    Fax: '',
    Email: ''
  }
  const form = ref({
    LastName: '',
    FirstName: '',
    Title: '',
    ReportsTo: '',
    BirthDate: '',
    HireDate: '',
    Address: '',
    City: '',
    State: '',
    Country: '',
    PostalCode: '',
    Phone: '',
    Fax: '',
    Email: ''
  });



  const on_submit = async () => {
    try {
      if (route.meta.type == 'insert') {
        await empleadosStore.createEmpleado(form.value)
        form.value = {... defaultform}
        //router.push({ name: 'detalle-empleado', params: { id: route.params.id } });
      } else if(route.meta.type == 'update') {
        empleadosStore.updateEmpleado(form.value)
        router.push({ name: 'detalle-empleado', params: { id: route.params.id } });
      }
    } catch (err) {
      error.value = err
    }
  };

  onMounted(async() => {
    if(route.meta.type == 'update') {
      const data = await empleadosStore.getEmpleadoById(route.params.id)
      form.value = { ...data }
    }

  });

</script>
