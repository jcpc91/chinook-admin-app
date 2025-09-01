import { createFetch } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { environment as config } from '@/config/environment.js'

const authStore = useAuthStore()
export const useMyFetch = createFetch({
    baseUrl: config.api.baseUrl,
    options: {
        beforeFetch: ({ options }) => {
            const token = authStore.user
            const corsSettings = config.getCorsSettings();

            options.headers = {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            }
            options.credentials = corsSettings.credentials;
            options.mode = corsSettings.mode;
            return { options }
        },
    },
})
