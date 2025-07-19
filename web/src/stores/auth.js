import { defineStore } from 'pinia'
import { useServerAuth } from '@/services/authserver'
import { watch, ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const { data, error, execute, statusCode, isFetching, post } = useServerAuth('', {method: 'post'}, {immediate: false, initialData: {}})

    watch(error, () => {
        console.log('watch error', error.value)
    })
    watch(data, () => {
        console.log('watch data', data.value)
    })

    async function logout() {
        this.isAuthenticated = false
        this.user = null
        // Optionally, redirect to login or home page can be handled here or in the component
        // For example, by using the router instance if it's made available to the store
        // or by router.push('/login') in the component calling logout.
        console.log('User logged out.')
        }
    return {
        execute,
        statusCode,
        data,
        error,
        isFetching,
        post,
        logout,
    }
})
