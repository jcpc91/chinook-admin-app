import { createFetch } from '@vueuse/core';

export const useServerAuth = createFetch({
    baseUrl: 'https://8080-cs-337107985405-default.cs-us-central1-pits.cloudshell.dev',
    options: {
        beforeFetch: ({ options }) => {
            options.headers = {
                'Content-Type': 'application/json',
            }
            return { options }
        }
    }
})
