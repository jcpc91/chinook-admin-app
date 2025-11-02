<template>
    <div class="box">
        <h1>Index view register</h1>
        <button  @click="store.actor.send({ type: 'next' })">Next</button>
        <button @click="on_start">Start</button>
        <button @click="on_stop">Stop</button>
        <button @click="router.push('/login')">Login</button>
        <pre>
state: {{ store.currentState }}
        </pre>
        <router-view></router-view>
    </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted, onActivated } from "vue";
import { storeToRefs } from 'pinia';
import { useRoute, useRouter  } from "vue-router";
import { useRegisterStore } from "../../stores/register";

const route = useRoute()
const router = useRouter()

const store = useRegisterStore();
const subscription = store.actor.subscribe((state) => {
    router.push({ name: state.value})

})

onMounted(() => {
    store.actor.start()
    if (route.name != store.currentState.value)
        router.push({ name: store.currentState.value})
})

onUnmounted(() => {
    subscription.unsubscribe()
})

function on_start() {
    store.actor.start()
}

function on_stop() {
    store.actor.stop()
}
</script>
