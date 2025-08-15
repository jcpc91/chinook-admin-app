
<template>
  <div>
    <!-- Overlay -->
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
      @click="closeDrawer"
    ></div>

    <!-- Drawer -->
    <div
      :class="[
        'fixed top-0 right-0 h-full bg-white dark:bg-gray-800 shadow-lg z-50 transform transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : 'translate-x-full',
        widthClass
      ]"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ title }}
        </h2>
        <button
          @click="closeDrawer"
          class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-4 h-full overflow-y-auto">
        <slot></slot>
      </div>

      <!-- Footer (optional) -->
      <div v-if="$slots.footer" class="border-t border-gray-200 dark:border-gray-700 p-4">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Drawer'
  },
  width: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl', '2xl'].includes(value)
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'update:isOpen'])

const widthClass = computed(() => {
  const widthMap = {
    sm: 'w-80',
    md: 'w-96',
    lg: 'w-1/3',
    xl: 'w-2/5',
    '2xl': 'w-1/2'
  }
  return widthMap[props.width] || widthMap.md
})

const closeDrawer = () => {
  if (props.closeOnOverlay) {
    emit('close')
    emit('update:isOpen', false)
  }
}

// Prevent body scroll when drawer is open
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Handle Escape key
const handleEscape = (event) => {
  if (event.key === 'Escape' && props.isOpen) {
    closeDrawer()
  }
}

// Add/remove event listener for escape key
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', handleEscape)
  } else {
    document.removeEventListener('keydown', handleEscape)
  }
})
</script>
