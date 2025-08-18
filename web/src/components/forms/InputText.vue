<template>
  <div>

    <input
      class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline uppercase"
      :id="props.name" :type="props.type || 'text'" :placeholder="props.placeholder" @change="updateValue"
      :value="props.modelValue" :class="valid" />

  </div>
</template>
<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'text'
  },
  placeholder: String,
  name: String,
  modelValue: String,
  valid: {
    type: Boolean,
    default: true

  }
})

const emit = defineEmits(['update:modelValue'])
const updateValue = (event) => {
  emit('update:modelValue', event.target.value)
}
const valid = computed(() => {
  if (props.valid) {
    return 'border-green-500'
  } else {
    return 'border-red-500'
  }
})


</script>
