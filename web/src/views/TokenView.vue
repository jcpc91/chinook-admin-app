
<template>
    <div class="token-container">
        <h2>Token Verification</h2>
        <form @submit.prevent="handleTokenSubmit">
            <div class="form-group">
                <label for="token">Enter Token (Numbers only)</label>
                <input 
                    type="text" 
                    id="token" 
                    v-model="token" 
                    @input="validateInput"
                    placeholder="Enter numeric token"
                    required 
                />
            </div>
            <div v-if="error" class="error-message">{{ error }}</div>
            <div v-if="success" class="success-message">{{ success }}</div>
            <div class="flex justify-between">
                <button type="submit">Verify Token</button>
                <button type="button" @click="router.push('/login')">Back to Login</button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const token = ref('');
const error = ref('');
const success = ref('');
const router = useRouter();

const validateInput = (event) => {
    // Remove any non-numeric characters
    const value = event.target.value.replace(/[^0-9]/g, '');
    token.value = value;
    error.value = '';
};

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
        success.value = 'Token verified successfully!';
        
        // You can add additional logic here, such as:
        // - Redirect to a specific page
        // - Store token information
        // - Call authentication service
        
    } catch (err) {
        error.value = err.message || 'Failed to verify token. Please try again.';
    }
};
</script>

<style scoped>
.token-container {
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
    font-size: 16px;
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
