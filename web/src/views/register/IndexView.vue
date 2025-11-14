<template>
    <div class="box">

        <pre>
state: {{ store.currentState }}
        </pre>
        <pre>
            token: {{ store.Token }}
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


</script>
