import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd(), '')

  // Get all VITE_ prefixed environment variables for injection
  const viteEnvVars = Object.keys(env)
    .filter(key => key.startsWith('VITE_'))
    .reduce((acc, key) => {
      acc[`__${key}__`] = JSON.stringify(env[key])
      return acc
    }, {})

  // Parse CORS origins for better handling
  const corsOrigins = env.VITE_CORS_ORIGIN
    ? env.VITE_CORS_ORIGIN.split(',').map(origin => origin.trim())
    : [
        'http://localhost:5173',
        'http://host.docker.internal:5173',
        'http://127.0.0.1:5173'
      ]

  return {
    plugins: [vue(), vueDevTools(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
      port: parseInt(env.VITE_PORT) || 5173,
      allowedHosts: ['a9d7b8d7-5663-4079-ba59-894a635ed946-00-37o6ps7olmswx.picard.replit.dev'],
      watch: {
        usePolling: true,
      },
      // Configure CORS for containerized development
      cors: {
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: [
          'Content-Type',
          'Authorization',
          'X-Requested-With',
          'Accept',
          'Origin',
          'Cache-Control',
          'X-File-Name'
        ],
        exposedHeaders: ['Content-Length', 'X-Kuma-Revision'],
        maxAge: 86400, // 24 hours
      },
      // Configure proxy for development when using containerized web with local backends
      proxy: mode === 'development' && env.VITE_USE_PROXY === 'true' ? {
        '/api': {
          target: env.VITE_BASE_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req) => {
              if (env.VITE_ENABLE_DEBUG === 'true') {
                console.log('Sending Request to the Target:', req.method, req.url);
              }
            });
            proxy.on('proxyRes', (proxyRes, req) => {
              if (env.VITE_ENABLE_DEBUG === 'true') {
                console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
              }
            });
          },
        },
        '/auth': {
          target: env.VITE_URL_AUTH || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/auth/, ''),
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.log('Auth proxy error:', err);
            });
          },
        },
        '/catalogos': {
          target: env.VITE_CATALOGOS_URL || 'http://localhost:3002',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/catalogos/, ''),
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.log('Catalogos proxy error:', err);
            });
          },
        },
      } : undefined,
    },
    preview: {
      host: '0.0.0.0',
      port: parseInt(env.VITE_PREVIEW_PORT) || 4173,
      cors: {
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: [
          'Content-Type',
          'Authorization',
          'X-Requested-With',
          'Accept',
          'Origin'
        ],
      },
    },
    // Inject all VITE_ prefixed environment variables
    define: {
      ...viteEnvVars,
      // Ensure critical variables are always available
      __VITE_MODE__: JSON.stringify(env.VITE_MODE || mode),
      __VITE_BASE_URL__: JSON.stringify(env.VITE_BASE_URL || 'http://localhost:3001'),
      __VITE_URL_AUTH__: JSON.stringify(env.VITE_URL_AUTH || 'http://localhost:3000'),
      __VITE_CATALOGOS_URL__: JSON.stringify(env.VITE_CATALOGOS_URL || 'http://localhost:3002'),
    },
    // Environment-specific build optimizations
    build: {
      // Optimize for production
      minify: mode === 'production' ? 'esbuild' : false,
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
            ui: ['vue3-easy-data-table'],
          },
        },
      },
    },
  }
})
