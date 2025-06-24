import { defineStore } from 'pinia';
const BASE_URL = import.meta.env.VITE_BASE_URL

const apiclient = {
  login: async (username, password) => {
    // Fake authentication logic
    if (username === 'admin' && password === 'password') {
      const url = new URL('generate-token', BASE_URL)
      const response = await fetch(url)
      return response.json
    } else {
      return Promise.reject(new Error('Invalid username or password.'))
    }
  }
}
export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null, // Will store user information like username
    error: null, // For storing login error messages
  }),
  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
    authError: (state) => state.error,
  },
  actions: {
    async login(username, password) {
      try {
        this.error = null; // Reset error before attempting login
        this.user = await apiclient.login(username, password)
      }catch (error) {
        this.error = error.message || 'Failed to login. Please check your credentials.';
      }
      
    },
    logout() {
      this.isAuthenticated = false;
      this.user = null;
      // Optionally, redirect to login or home page can be handled here or in the component
      // For example, by using the router instance if it's made available to the store
      // or by router.push('/login') in the component calling logout.
      console.log('User logged out.');
    },
  },
});
