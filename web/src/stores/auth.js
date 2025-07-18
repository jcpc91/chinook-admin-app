import { defineStore } from 'pinia'
import { useServerAuth } from '@/services/authserver'
import { ref} from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const loading = ref(false)
    const error = ref(null)
    async function login(payload) {
        try {
            loading.value = true
            const result = await useServerAuth('', {immediate: false}).post(payload).json()
            if (result.statusCode.value === 401)
                throw new Error('Invalid credentials')

            return result.data.value
        } catch (error) {
            error.value = error.message
            throw error
        } finally {
            loading.value = false
        }
    }
    async function logout() {
        this.isAuthenticated = false
        this.user = null
        // Optionally, redirect to login or home page can be handled here or in the component
        // For example, by using the router instance if it's made available to the store
        // or by router.push('/login') in the component calling logout.
        console.log('User logged out.')
        }
    return {
        loading,
        error,
        logout,
        login
    }
})
