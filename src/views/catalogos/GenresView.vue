<template>
  <form action="">

    <h2>Genresview</h2>
    <InputText v-model="value.valor1" label="Mail" placeholder="mimail@mail.com" name="Mail" />

    <p class="text-red-500 text-xs italic mt-2">Invalid email</p>
    <InputSelect v-model="value.valor2" label="Genero" name="genero" :options="optionsvalues" />
    <div>
      <Button type="button" label="Aceptar" color="dark"></Button>
    </div>
    <p>
    <pre>{{ value }}</pre>
    </p>
    <ProfileCard />
  </form>
</template>
<script setup>
import { ref, reactive } from "vue";
import InputText from "../../components/forms/inputText/index.vue";
import InputSelect from "@/components/forms/InputSelect.vue";
import Button from '@/components/forms/InputButton.vue'
import ProfileCard from "@/components/common/ProfileCard.vue";
const value = ref({});
const optionsvalues = reactive([
  { label: "Label 1", value: "1" },
  { label: "Label 2", value: "2" },
  { label: "Label 3", value: "3" }
])
</script>
