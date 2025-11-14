<template>
    <StepItem :step="0" title="Error" description="Error ">
        <div class="error-message">{{ Error }}</div>
        <InputButton label="Regresar" @click="actor.send({type: 'back'})"></InputButton>
    </StepItem>
</template>
<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import StepItem from "../../components/common/StepItem.vue";
import InputText from '@/components/forms/InputText.vue';
import InputButton from '@/components/forms/InputButton.vue';
import { useRegisterStore } from "../../stores/register";

const { actor, Error } = useRegisterStore();

</script>
