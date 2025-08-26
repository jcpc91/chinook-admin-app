import { defineStore } from 'pinia'
import { useServerAuth, useServerTokenRegister } from '@/services/authserver'
import { useLocalStorage } from '@vueuse/core'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: useLocalStorage('isAuthenticated', false),
    user: useLocalStorage('user', null), // Will store user information like username and token

    tokenRegister: null // token de registro
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
        .then(({ data, error, _statusCode }) => {
          if (error.value) {
            throw error.value
          }

          this.user = data.value.token
          this.isAuthenticated = true
        })
    },
    logout() {
      this.isAuthenticated = false
      this.user = null
      // useLocalStorage automatically syncs these changes to localStorage
      console.log('User logged out.')
    },
    async register(payload) {
      return useServerAuth('/register')
        .post(payload)
        .json()
        .then(({ _data, error, statusCode }) => {

          if (statusCode.value >= 400) {
            throw error.value
          }
        })
    },
    async verifyToken(token) {
      return useServerTokenRegister('/verify')
        .post(token)
        .json()
        .then(({ data, error, statusCode }) => {

          if (error.value) {
            throw error.value
          }

          if (statusCode.value >= 400) {
            throw error.value
          }
          this.tokenRegister = data.value.token
        })
    }
  },
})
