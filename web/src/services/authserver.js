import { createFetch } from '@vueuse/core';
import { useAuthStore } from "../stores/auth";


const base = import.meta.env.VITE_URL_AUTH

export const useServerAuth = createFetch({
    baseUrl: base,
    options: {
        beforeFetch: ({ options }) => {
            options.headers = {
                'Content-Type': 'application/json',
            }
            return { options }
        }
    }
})

export const useServerTokenRegister = createFetch({
    baseUrl: base,
    options: {
        beforeFetch: ({ options }) => {
            const authStore = useAuthStore()
            const token = authStore.tokenRegister
            options.headers = {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            }
            return { options }
        }
    }
})

