<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">Username</label>
        <input type="text" id="username" v-model="username" required />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <div v-if="error" class="error-message">{{ error }}</div>
      <button type="submit">Login</button>
      <div>isLoggedIn:{{ authStore.isLoggedIn }},currentUser:{{ authStore.currentUser }},authError:{{ authStore.authError }}
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // Assuming auth store will be at @/stores/auth

const username = ref('admin');
const password = ref('password');
const error = ref('');
const router = useRouter();
const authStore = useAuthStore();

const handleLogin = async () => {
  error.value = ''; // Reset error message
  try {
    await authStore.login(username.value, password.value);
    // Redirect to home or originally intended route
    const redirectPath = router.currentRoute.value.query.redirect || '/';
    console.log('Redirecting to:', redirectPath);
    router.push(redirectPath);
  } catch (err) {
    error.value = err.message || 'Failed to login. Please check your credentials.';
  }
};
</script>

<style scoped>
.login-container {
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
</style>
