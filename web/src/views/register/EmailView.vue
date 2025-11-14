<template>
    <StepItem :step="1" title="Register" description="Register with your email ">
        {{ register.isFetching ? 'Fetching' : '' }}
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
        <div>{{ register.data.token }}</div>
    </StepItem>
</template>
<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import StepItem from "../../components/common/StepItem.vue";
import InputText from '@/components/forms/InputText.vue';
import InputButton from '@/components/forms/InputButton.vue';
import { useRegisterStore } from "../../stores/register";


const router = useRouter();
const { actor, reister } = useRegisterStore();

const email = ref('');
const error = ref('');
const success = ref('');


const handleRegister = async () => {
    error.value = '';
    success.value = '';



    try {

        register.post({ email: email.value }).json().execute(true)
        .then((result) => {
            success.value = 'Registration successful! Redirecting to login...';
            const e = { type: 'next', feedback: 'Some other feedback'}
            actor.send(e);
        })
        .catch((err) => {
            error.value = err.message || 'Failed to register. Please try again.';
            actor.send({type: 'error'})
        });

    } catch (err) {
        error.value = err.message || 'Failed to register. Please try again.';
    }
};



</script>
