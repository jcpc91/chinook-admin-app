import { fileURLToPath } from 'node:url'
import { defineConfig, configDefaults } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'e2e/**'],
    root: fileURLToPath(new URL('./', import.meta.url)),
    globals: true,
    // Container-specific test settings
    testTimeout: 30000, // Increased timeout for container tests
    hookTimeout: 30000,
    teardownTimeout: 30000,
    // Run tests sequentially in containers
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    // Environment variables for containerized testing
    env: {
      VITE_MODE: 'test',
      VITE_BASE_URL: 'http://app:3001',
      VITE_URL_AUTH: 'http://auth:3000',
      VITE_CATALOGOS_URL: 'http://catalogos:3002',
      NODE_ENV: 'test'
    }
  },
})
