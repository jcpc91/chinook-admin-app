
<template>
    <div class="register-container">
        <h2>Register</h2>
        <form @submit.prevent="handleRegister">

            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" v-model="email" required />
            </div>

            <div v-if="error" class="error-message">{{ error }}</div>
            <div v-if="success" class="success-message">{{ success }}</div>

            <div class="flex justify-between">
                <button type="submit">Register</button>
                <button type="button" @click="router.push('/login')">Back to Login</button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useAsyncState } from '@vueuse/core'

const authStore = useAuthStore();
const { error, execute } = useAsyncState(action, {}, { immediate: false})

const email = ref('');

const success = ref('');
const router = useRouter();

const handleRegister = async () => {
    error.value = '';
    success.value = '';


    await execute()


};

async function action() {
    console.log('action')
    try {
        await authStore.register({email: email.value})
        success.value = 'Registration successful! Redirecting to login...';


        router.push({name: 'token'})
    } catch (err) {
        error.value = err || 'Failed to register. Please try again.';
    }
}
</script>

<style scoped>
.register-container {
    max-width: 400px;
    margin: 50px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
}

.form-group input {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
    border: 1px solid #ddd;
    border-radius: 3px;
}

.error-message {
    color: red;
    margin-bottom: 15px;
}

.success-message {
    color: green;
    margin-bottom: 15px;
}

.flex {
    display: flex;
}

.justify-between {
    justify-content: space-between;
}

button {
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
}

button:hover {
    background-color: #0056b3;
}

button[type="button"] {
    background-color: #6c757d;
}

button[type="button"]:hover {
    background-color: #545b62;
}
</style>
