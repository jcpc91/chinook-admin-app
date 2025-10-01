<template>
    <div class="relative bg-gray-50 rounded-xl">
        <div class="p-6 space-y-4">
            <div class="block w-10 h-10 mx-auto -mt-12 rounded-full ring-8 ring-white">
                <div class="w-10 h-10 rounded-full shadow-sm">
                    <div class="flex items-center justify-center w-10 h-10 text-lg font-bold bg-white rounded-full shadow-lg text-primary-600 tabular-nums">
                        {{ props.step }}
                    </div>
                </div>
            </div>

            <div class="space-y-1">
                <h3 class="text-xl font-bold tracking-tight md:text-2xl">
                    {{ props.title }}
                </h3>

                <p class="text-gray-600">
                    {{ props.description }}
                </p>
            </div>


            <hr class="border-gray-200 border-dashed">

            <slot></slot>
        </div>
    </div>
</template>
<script setup>
import { defineProps } from "vue";

const props = defineProps({
    step: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        required: false,
    },
});

</script>
