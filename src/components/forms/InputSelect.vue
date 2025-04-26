<template>
  <div class="max-w-sm mx-auto">
    <label :for="props.name" class="block text-gray-700 font-bold mb-2">{{ props.label }}</label>
    <select
      class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline "
      @change="updateValue" :value="props.modelValue" :name="props.name" :id="props.name">
      <option v-for="option in props.options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

  </div>
</template>
<script setup>
const props = defineProps({
  label: String,
  name: String,
  options: Array
})

const emit = defineEmits(['update:modelValue'])
const updateValue = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>
