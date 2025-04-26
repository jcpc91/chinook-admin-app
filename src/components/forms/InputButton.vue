<template>
  <button :type="props.type"
    class="border rounded-md px-4 py-2 m-2 transition duration-500 ease select-none focus:outline-none focus:shadow-outline"
    :class="color">
    {{ props.label }}
  </button>
</template>
<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'button',
  },
  label: {
    type: String,
  },
  color: {
    type: String,
    default: 'primary',
  },
})
const color = computed(() => {
  switch (props.color) {
    case 'primary':
      return 'bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-500'
    case 'success':
      return 'border-green-500 bg-green-500 text-white hover:bg-green-600'
    case 'warning':
      return 'border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600'
    case 'danger':
      return 'border-red-500 bg-red-500 text-white hover:bg-red-600'
    case 'info':
      return 'border-teal-500 bg-teal-500 text-white hover:bg-teal-600'
    case 'dark':
      return 'border-gray-700 bg-gray-700 text-white hover:bg-gray-800'
    case 'light':
      return 'border-gray-200 bg-gray-200 text-gray-700 hover:bg-gray-300'
    default:
      return 'border-gray-200 bg-gray-200 text-gray-700 hover:bg-gray-300'
  }
})
</script>
