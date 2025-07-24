import { createFetch } from '@vueuse/core';
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
export const useMyFetch = createFetch({
    baseUrl: import.meta.env.VITE_BASE_URL,
    options: {
        beforeFetch: ({ options }) => {
            const token = authStore.user?.token;
            options.headers = {
                'Content-Type': 'application/json',
                ...(token && { "Authorization": `Bearer ${token}` })
            }
            return { options }
        }
    },
});


