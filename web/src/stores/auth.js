import { defineStore } from 'pinia';
import { useServerAuth } from "@/services/authserver";


const apiclient = {
  login: async (username, password) => {
    // Fake authentication logic
    const payload = {
        'username': username,
        'password': password,

    }
    console.log(payload);
    return useServerAuth().post(payload).json();

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
        const payload = {
            'username': username,
            'password': password,

        }
        console.log(payload);
        const url = 'https://8080-cs-337107985405-default.cs-us-central1-pits.cloudshell.dev'
        const data = await fetch(url,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),

        }).then((response) => response.json())

        // const data = await useServerAuth().post(payload)
        console.log(data);
        this.user = {}
        this.isAuthenticated = true;
      }catch (error) {

        console.table(error)
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
