<template>
    <DropDown v-model="modelValue" label="Empleado" name="Empleado"
    :options="items"
    item-value="id"
    item-title="title"
     />
</template>
<script setup>
import DropDown from "@/components/forms/InputSelect.vue";
import { reactive } from "vue";

const modelValue = defineModel({required: true})
const items = reactive([])
</script>
