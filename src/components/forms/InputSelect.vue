<template>
  <div>

    <select
      class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline "
      @change="updateValue" :value="props.modelValue" :name="props.name" :id="props.name">
      <option v-for="option in props.options" :key="option.value" :value="option[props.itemValue]">
        {{ option[props.itemTitle] }}
      </option>
    </select>

  </div>
</template>
<script setup>
const props = defineProps({
  name: String,
  options: Array,
  itemValue: String,
  itemTitle: String,
  modelValue: String
})

const emit = defineEmits(['update:modelValue'])
const updateValue = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>
