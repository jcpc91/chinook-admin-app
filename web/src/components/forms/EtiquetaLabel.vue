<template>
  <label :for="props.name" class="text-gray-700 font-bold ">
    {{ props.label }}
  </label>
</template>
<script setup>
const props = defineProps({
  label: String,
  name: String,
})
</script>
