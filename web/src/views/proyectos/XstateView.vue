<script setup>
import { onMounted, ref } from "vue";
import { createMachine, fromPromise, createActor } from 'xstate'
import StepItem from "@/components/forms/StepItem.vue";

const currentStep = ref("")
const stepsMachine = createMachine({
  id: 'steps',
  initial: 'step1',
  states: {
    step1: {
      on: {
        NEXT: {
            target: 'step2',
            actions: () => {
                console.log('actions next')
            },

        }
      }
    },
    step2: {
      on: {
        NEXT: 'step3',
        PREV: 'step1'
      }
    },
    step3: {
      on: {
        PREV: 'step2'
      }
    }
  }
})
const promise1 = fromPromise(() => new Promise((resolve) => {
    setTimeout(() => {
        resolve('promise1')
    }, 1000)
}))
const actor = createActor(stepsMachine)
const actor2 = createActor(promise1)


onMounted(() => {
    actor.subscribe((state) => {
        currentStep.value = state.value
    })
    actor2.subscribe((state) => {
        console.log(state.status, state.output);
    })
    actor.start()
    actor2.start()
})
</script>

<template>
    <pre>
        {{ currentStep }}
    </pre>
<ol class="grid gap-8 md:grid-cols-3 p-6">
    <li v-show="currentStep == 'step1'" >
        <StepItem :step="1" title="Create a Server" description="Select any of these server providers, or use your own.">
            <ul class="space-y-1 font-medium text-gray-500">
                <li>UpCloud</li>
                <li>Digital Ocean</li>
                <li>Linode</li>
                <li>AWS EC2!!</li>
                <li>...</li>
            </ul>
        </StepItem>
    </li>

    <li v-show="currentStep == 'step2'" class="relative bg-gray-50 rounded-xl">
        <div class="p-6 space-y-4">
            <div class="block w-10 h-10 mx-auto -mt-12 rounded-full ring-8 ring-white">
                <div class="w-10 h-10 rounded-full shadow-sm">
                    <div
                        class="flex items-center justify-center w-10 h-10 text-lg font-bold bg-white rounded-full shadow-lg text-primary-600 tabular-nums">
                        2
                    </div>
                </div>
            </div>

            <div class="space-y-1">
                <h3 class="text-xl font-bold tracking-tight md:text-2xl">Connect GIT repository</h3>

                <p class="text-gray-600">
                    Connect your GIT repository and let Ploi handle the rest.
                </p>
            </div>


            <hr class="border-gray-200 border-dashed">

            <ul class="space-y-1 font-medium text-gray-500">
                <li>laravel/laravel</li>
                <li>statamic/statamic</li>
                <li>...</li>
            </ul>
        </div>
        <div class=" w-full p-6">
            <button @click="actor2.send({ type: 'NEXT' })">Next actor 2</button>
        </div>
    </li>

    <li v-show="currentStep == 'step3'" class="relative bg-gray-50 rounded-xl">
        <div class="p-6 space-y-4">
            <div class="block w-10 h-10 mx-auto -mt-12 rounded-full ring-8 ring-white">
                <div class="w-10 h-10 rounded-full shadow-sm">
                    <div
                        class="flex items-center justify-center w-10 h-10 text-lg font-bold bg-white rounded-full shadow-lg text-primary-600 tabular-nums">
                        3
                    </div>
                </div>
            </div>

            <div class="space-y-1">
                <h3 class="text-xl font-bold tracking-tight md:text-2xl">Deploy your application
                </h3>

                <p class="text-gray-600">
                    Click, deploy and sit back ☕️
                </p>
            </div>


            <hr class="border-gray-200 border-dashed">

            <ul class="flex flex-col w-full p-4 space-y-1 font-mono text-sm font-medium text-white bg-gray-800 rounded">
                <li>Mon, Apr 26, 2021 11:47 AM</li>
                <li>10 files changed, 13004 insertions(+), 22 deletions(-)</li>
                <li>...</li>
                <li>🚀 Application deployed!</li>
            </ul>
        </div>
    </li>
</ol>
</template>
