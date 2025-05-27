<template>
  <div class="bg-white px-4 py-6 shadow sm:rounded-lg sm:px-6">
    <div class="sm:flex sm:items-baseline sm:justify-between">
      <h3 class="text-base font-medium">
        <span class="text-gray-900">{{ props.title }}</span>

      </h3>
      <p class="mt-1 whitespace-nowrap text-sm text-gray-600 sm:mt-0 sm:ml-3">
        <slot name="buttons"></slot>
      </p>
    </div>
    <div class="mt-4 space-y-6 text-sm text-gray-800">

      <slot></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineProps } from 'vue'
const props = defineProps({
  title: {
    type: String,
    default: 'Panel'
  }
})

</script>
