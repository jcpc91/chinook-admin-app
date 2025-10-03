<template>
    <StepItem :step="3" title="Password" description="Set your password ">
        <h1>Password</h1>
        <button @click="actor.send({ type: 'back' })">Back</button>
    </StepItem>
</template>
<script setup>
import StepItem from "../../components/common/StepItem.vue";
import { useRegisterStore } from "../../stores/register";
const { actor} = useRegisterStore();


</script>
