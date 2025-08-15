
<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Right Drawer Example</h1>
    
    <!-- Buttons to open different drawer sizes -->
    <div class="space-x-4 mb-4">
      <button
        @click="openDrawer('sm')"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Open Small Drawer
      </button>
      
      <button
        @click="openDrawer('md')"
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        Open Medium Drawer
      </button>
      
      <button
        @click="openDrawer('lg')"
        class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
      >
        Open Large Drawer
      </button>
    </div>

    <!-- Right Drawer Component -->
    <RightDrawer
      v-model:isOpen="isDrawerOpen"
      :title="drawerTitle"
      :width="drawerWidth"
      @close="closeDrawer"
    >
      <!-- Main content -->
      <div class="space-y-4">
        <p class="text-gray-600 dark:text-gray-300">
          This is the content of the right drawer. You can put any content here.
        </p>
        
        <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded">
          <h3 class="font-semibold mb-2">Example Form</h3>
          <form class="space-y-3">
            <div>
              <label class="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Message</label>
              <textarea
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                placeholder="Enter your message"
              ></textarea>
            </div>
          </form>
        </div>
      </div>

      <!-- Footer slot example -->
      <template #footer>
        <div class="flex justify-end space-x-2">
          <button
            @click="closeDrawer"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Save
          </button>
        </div>
      </template>
    </RightDrawer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import RightDrawer from './RightDrawer.vue'

const isDrawerOpen = ref(false)
const drawerWidth = ref('md')
const drawerTitle = ref('Right Drawer')

const openDrawer = (width) => {
  drawerWidth.value = width
  drawerTitle.value = `${width.toUpperCase()} Right Drawer`
  isDrawerOpen.value = true
}

const closeDrawer = () => {
  isDrawerOpen.value = false
}
</script>
