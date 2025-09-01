import { createFetch } from '@vueuse/core';
import { environment as config } from '@/config/environment.js';

export const useServerAuth = createFetch({
    baseUrl: config.api.authUrl,
    options: {
        beforeFetch: ({ options }) => {
            const corsSettings = config.getCorsSettings();
            options.headers = {
                'Content-Type': 'application/json',
            };
            options.credentials = corsSettings.credentials;
            options.mode = corsSettings.mode;
            return { options }
        }
    }
})
