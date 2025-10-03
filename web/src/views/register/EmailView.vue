<template>
    <StepItem :step="1" title="Register" description="Register with your email ">

        <h1>Email view</h1>

        <button @click="actor.send({ type: 'next' })">Next</button>
    </StepItem>
</template>
<script setup>
import StepItem from "../../components/common/StepItem.vue";
import { useRegisterStore } from "../../stores/register";

const { actor} = useRegisterStore();


</script>
