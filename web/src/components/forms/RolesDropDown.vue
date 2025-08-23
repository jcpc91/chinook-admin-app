<template>
  <DropDown v-model="modelValue" label="Rol" name="rol" :options="data" item-value="id" item-title="title" />
</template>
<script setup>
import DropDown from "@/components/forms/InputSelect.vue";
import { reactive } from "vue";

const modelValue = defineModel({ required: true });
const data = reactive([
  { id: "ADMINISTRADOR", title: 'ADMINISTRADOR' },
  { id: "USUARIO", title: 'USUARIO' },
])
</script>
