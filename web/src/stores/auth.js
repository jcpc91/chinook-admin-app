import { defineStore } from 'pinia'
import { useServerAuth } from '@/services/authserver'

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
      this.error = null // Reset error before attempting login
      const payload = {
        username: username,
        password: password,
      }

      return useServerAuth('')
        .post(payload)
        .json()
        .then(({data, error}) => {
          
          if (error.value) {
            throw error.value
          }
          this.user = data.value
          this.isAuthenticated = true
        })
        .catch((err) => {
          console.error('Login failed:', err)
          this.error = err
        })
    },
    logout() {
      this.isAuthenticated = false
      this.user = null
      // Optionally, redirect to login or home page can be handled here or in the component
      // For example, by using the router instance if it's made available to the store
      // or by router.push('/login') in the component calling logout.
      console.log('User logged out.')
    },
  },
})
