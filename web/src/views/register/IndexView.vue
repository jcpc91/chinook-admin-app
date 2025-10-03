<template>
    <div class="box">
        <h1>Index view register</h1>

        <pre>
state: {{ store.currentState }}
        </pre>
        <router-view></router-view>
    </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from "vue-router";
import { useRegisterStore } from "../../stores/register";


const router = useRouter()

const store = useRegisterStore();
store.actor.subscribe((state) => {

    router.push({ name: state.value})
})

onMounted(() => {
    store.actor.start()
})
</script>
