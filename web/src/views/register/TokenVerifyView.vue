<template>
    <StepItem :step="2" title="Token Verify" description="Verify the token sent to your email ">
        <h1>Token Verify</h1>
        <button @click="actor.send({ type: 'back' })">Back</button>
        <button @click="actor.send({ type: 'next' })">Next</button>
    </StepItem>
</template>
<script setup>
import StepItem from "../../components/common/StepItem.vue";
import { useRegisterStore } from "../../stores/register";
const { actor} = useRegisterStore();
</script>
