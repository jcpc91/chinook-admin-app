<template>
    <div v-if="props.items" class="space-y-1">
        <button
        class="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none"
        aria-expanded="true" aria-controls="analytics-dropdown">
            <div class="flex items-center">
                <slot name="icon"></slot>

                {{ props.title }}
            </div>
            <svg class="ml-2 h-5 w-5 transform transition-transform duration-200" xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd" />
            </svg>
        </button>
        <div class="space-y-1 pl-11" id="analytics-dropdown">
            <router-link v-for="item in props.items" :key="item.id || item.name" :to="{ name: item.route }"
                class="group flex items-center px-4 py-2 text-sm text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">
                {{ item.name }}
            </router-link>

        </div>
    </div>
    <router-link v-else :to="{ name: props.route }"
          class="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white group transition-all duration-200">
          <slot name="icon"></slot>
          {{ props.title }}
        </router-link>
</template>
<script setup>
import { defineProps } from "vue";

const props = defineProps({
    title: String,
    route: String,
    items: Array
})
</script>
