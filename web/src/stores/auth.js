import { defineStore } from 'pinia';

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
      this.error = null; // Reset error before attempting login

      // Fake authentication logic
      return new Promise((resolve, reject) => {
        setTimeout(() => { // Simulate API call delay
          if (username === 'admin' && password === 'password') {
            this.isAuthenticated = true;
            this.user = { username: username };
            console.log('Login successful for user:', username);
            resolve();
          } else {
            this.error = 'Invalid username or password.';
            console.log('Login failed for user:', username);
            reject(new Error('Invalid username or password.'));
          }
        }, 500);
      });
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
