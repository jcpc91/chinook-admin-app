
<template>
    <div class="password-container">
        <h2>Set Password</h2>
        <div class="user-info">
            <div class="info-item">
                <label>Name:</label>
                <span class="info-value">{{ userName }}</span>
            </div>
            <div class="info-item">
                <label>Email:</label>
                <span class="info-value">{{ userEmail }}</span>
            </div>
        </div>
        
        <form @submit.prevent="handlePasswordSubmit">
            <div class="form-group">
                <label for="password">Password</label>
                <input 
                    type="password" 
                    id="password" 
                    v-model="password" 
                    placeholder="Enter your password"
                    required 
                />
            </div>
            <div class="form-group">
                <label for="confirmPassword">Confirm Password</label>
                <input 
                    type="password" 
                    id="confirmPassword" 
                    v-model="confirmPassword" 
                    placeholder="Confirm your password"
                    required 
                />
            </div>
            
            <div v-if="error" class="error-message">{{ error }}</div>
            <div v-if="success" class="success-message">{{ success }}</div>
            
            <div class="flex justify-between">
                <button type="submit" class="register-btn">Register</button>
                <button type="button" class="cancel-btn" @click="handleCancel">Cancel</button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const password = ref('');
const confirmPassword = ref('');
const userName = ref('');
const userEmail = ref('');
const error = ref('');
const success = ref('');
const router = useRouter();
const route = useRoute();

onMounted(() => {
    // Get user data from route query parameters or localStorage
    userName.value = route.query.name || localStorage.getItem('tempUserName') || 'John Doe';
    userEmail.value = route.query.email || localStorage.getItem('tempUserEmail') || 'user@example.com';
});

const handlePasswordSubmit = async () => {
    error.value = '';
    success.value = '';

    // Validation
    if (!password.value) {
        error.value = 'Please enter a password';
        return;
    }

    if (password.value.length < 6) {
        error.value = 'Password must be at least 6 characters long';
        return;
    }

    if (password.value !== confirmPassword.value) {
        error.value = 'Passwords do not match';
        return;
    }

    try {
        // TODO: Implement user registration API call with password
        const registrationData = {
            name: userName.value,
            email: userEmail.value,
            password: password.value
        };

        console.log('Registration data:', registrationData);
        
        // For now, show success message
        success.value = 'Registration completed successfully!';
        
        // Clear temporary data
        localStorage.removeItem('tempUserName');
        localStorage.removeItem('tempUserEmail');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
            router.push({ name: 'login' });
        }, 2000);
        
    } catch (err) {
        error.value = err.message || 'Failed to complete registration. Please try again.';
    }
};

const handleCancel = () => {
    // Clear any temporary data and go back to register
    localStorage.removeItem('tempUserName');
    localStorage.removeItem('tempUserEmail');
    router.push({ name: 'register' });
};
</script>

<style scoped>
.password-container {
    max-width: 400px;
    margin: 50px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-info {
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 5px;
    margin-bottom: 20px;
    border: 1px solid #e9ecef;
}

.info-item {
    display: flex;
    margin-bottom: 10px;
    align-items: center;
}

.info-item:last-child {
    margin-bottom: 0;
}

.info-item label {
    font-weight: bold;
    min-width: 60px;
    color: #495057;
}

.info-value {
    color: #212529;
    margin-left: 10px;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
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
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
}

.register-btn {
    background-color: #28a745;
    color: white;
}

.register-btn:hover {
    background-color: #218838;
}

.cancel-btn {
    background-color: #6c757d;
    color: white;
}

.cancel-btn:hover {
    background-color: #545b62;
}
</style>
