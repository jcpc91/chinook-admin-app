<template>
  <DropDown v-model="modelValue" label="Categoria" name="categoria" :options="data" item-value="id"
    item-title="title" />
</template>
<script setup>
import { defineModel } from 'vue';
import DropDown from "@/components/forms/InputSelect.vue";
import { useCatalogosStore } from "@/stores/catalogos";
import { reactive, onMounted, computed } from "vue";

const catalogosStore = useCatalogosStore()
const modelValue = defineModel({ required: true });
const data = reactive([])
</script>