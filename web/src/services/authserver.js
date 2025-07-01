import { createFetch } from '@vueuse/core';
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
