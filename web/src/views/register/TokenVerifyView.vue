<template>
    <StepItem :step="2" title="Token Verify" description="Verify the token sent to your email ">
        <form @submit.prevent="handleTokenSubmit">
            <div class="form-group">
                <label for="token">Enter Token (Numbers only)</label>
                <InputText v-model="token" type="text" id="token" placeholder="Enter numeric token" required />

            </div>
            <div v-if="error" class="error-message">{{ error }}</div>
            <div v-if="success" class="success-message">{{ success }}</div>
            <div class="flex justify-between">
                <InputButton @click="actor.send({ type: 'back' })" type="button" label="Back"></InputButton>
                <InputButton type="submit" label="Verify Token"></InputButton>

            </div>
        </form>
    </StepItem>
</template>
<script setup>
import { ref } from 'vue';
import StepItem from "../../components/common/StepItem.vue";
import InputText from '@/components/forms/InputText.vue';
import InputButton from '@/components/forms/InputButton.vue';
import { useRegisterStore } from "../../stores/register";

const { actor} = useRegisterStore();
const token = ref('');
const error = ref('');
const success = ref('');

const handleTokenSubmit = async () => {
    error.value = '';
    success.value = '';

    // Validation
    if (!token.value) {
        error.value = 'Please enter a token';
        return;
    }

    if (!/^\d+$/.test(token.value)) {
        error.value = 'Token must contain only numbers';
        return;
    }

    try {
        // TODO: Implement token verification API call
        // For now, just show success message
        success.value = 'Token verified successfully! Redirecting to password setup...';

        // Redirect to password view after successful verification
        setTimeout(() => {
            actor.send({ type: 'next' })
        }, 1500);

    } catch (err) {
        error.value = err.message || 'Failed to verify token. Please try again.';
    }
};
</script>
