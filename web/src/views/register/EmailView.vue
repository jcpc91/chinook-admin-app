<template>
    <StepItem :step="1" title="Register" description="Register with your email ">

        <form @submit.prevent="handleRegister">

            <div class="form-group">
                <label for="email">Email</label>
                <InputText v-model="email" type="email" id="email" placeholder="Enter your email" required />
            </div>

            <div v-if="error" class="error-message">{{ error }}</div>
            <div v-if="success" class="success-message">{{ success }}</div>
            <div class="flex justify-between">
                <InputButton label="Back to Login" type="button" @click="router.push('/login')" />
                <InputButton label="Next" type="submit" />
            </div>
        </form>

    </StepItem>
</template>
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import StepItem from "../../components/common/StepItem.vue";
import InputText from '@/components/forms/InputText.vue';
import InputButton from '@/components/forms/InputButton.vue';
import { useRegisterStore } from "../../stores/register";

const { actor} = useRegisterStore();
const router = useRouter();

const email = ref('');
const error = ref('');
const success = ref('');

const handleRegister = async () => {
    error.value = '';
    success.value = '';



    try {
        // TODO: Implement registration API call
        // For now, just show success message
        success.value = 'Registration successful! Redirecting to login...';

        setTimeout(() => {
            actor.send({ type: 'next' });
        }, 2000);
    } catch (err) {
        error.value = err.message || 'Failed to register. Please try again.';
    }
};



</script>
