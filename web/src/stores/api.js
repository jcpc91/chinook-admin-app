import { createFetch } from '@vueuse/core';
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
export const useMyFetch = createFetch({
    baseUrl: import.meta.env.VITE_BASE_URL,
    options: {
        beforeFetch: ({ options }) => {
            options.headers = {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${authStore.user.token}`
            }
            return { options }
        }
    },
});


