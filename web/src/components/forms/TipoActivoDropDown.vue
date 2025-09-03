<template>
  <DropDown v-model="modelValue" label="Tipo de Activo" name="tipo" :options="data" item-value="id" item-title="title" />
</template>
<script setup>
  import { ref, defineModel, defineProps, onMounted } from "vue";
  import DropDown from "@/components/forms/InputSelect.vue";
</script>