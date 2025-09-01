/**
 * Environment Configuration Utility
 * Provides centralized access to environment variables with fallbacks
 * and validation for containerized deployments
 */

// Environment variable getter with fallback support
const getEnvVar = (key, fallback = '') => {
  // Try to get from Vite's define first (build-time injection)
  const defineKey = `__VITE_${key.replace('VITE_', '')}__`
  if (typeof window !== 'undefined' && window[defineKey] !== undefined) {
    return window[defineKey]
  }

  // Try to get from import.meta.env (runtime)
  if (import.meta.env[key] !== undefined) {
    return import.meta.env[key]
  }

  // Return fallback
  return fallback
}

// Parse boolean environment variables
const getBooleanEnvVar = (key, fallback = false) => {
  const value = getEnvVar(key, fallback.toString())
  return value === 'true' || value === true
}

// Parse number environment variables
const getNumberEnvVar = (key, fallback = 0) => {
  const value = getEnvVar(key, fallback.toString())
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? fallback : parsed
}

// Parse array environment variables (comma-separated)
const getArrayEnvVar = (key, fallback = []) => {
  const value = getEnvVar(key, '')
  if (!value) return fallback
  return value.split(',').map(item => item.trim()).filter(Boolean)
}

// Environment configuration object
export const environment = {
  // Application mode
  mode: getEnvVar('VITE_MODE', 'desarrollo'),

  // API endpoints with containerized backend support
  api: {
    baseUrl: getEnvVar('VITE_BASE_URL', 'http://localhost:3001'),
    authUrl: getEnvVar('VITE_URL_AUTH', 'http://localhost:3000'),
    catalogosUrl: getEnvVar('VITE_CATALOGOS_URL', 'http://localhost:3002'),
    timeout: getNumberEnvVar('VITE_API_TIMEOUT', 10000),
    authTimeout: getNumberEnvVar('VITE_AUTH_TIMEOUT', 5000),
  },

  // Server configuration
  server: {
    port: getNumberEnvVar('VITE_PORT', 5173),
    previewPort: getNumberEnvVar('VITE_PREVIEW_PORT', 4173),
    useProxy: getBooleanEnvVar('VITE_USE_PROXY', false),
  },

  // CORS configuration for containerized communication
  cors: {
    origins: getArrayEnvVar('VITE_CORS_ORIGIN', ['http://localhost:5173']),
  },

  // Debug and logging
  debug: {
    enabled: getBooleanEnvVar('VITE_ENABLE_DEBUG', false),
    logLevel: getEnvVar('VITE_LOG_LEVEL', 'info'),
  },

  // Security settings
  security: {
    secureCookies: getBooleanEnvVar('VITE_SECURE_COOKIES', false),
    enableHttps: getBooleanEnvVar('VITE_ENABLE_HTTPS', false),
  },

  // Environment detection helpers
  isDevelopment: () => environment.mode === 'desarrollo',
  isStaging: () => environment.mode === 'staging',
  isProduction: () => environment.mode === 'production',
  isContainerized: () => {
    // Detect if running in containerized environment
    return environment.api.baseUrl.includes('host.docker.internal') ||
           environment.api.baseUrl.includes('app:') ||
           environment.api.authUrl.includes('auth:') ||
           environment.api.catalogosUrl.includes('catalogos:')
  },
}

// Validation function to ensure required environment variables are set
export const validateEnvironment = () => {
  const errors = []

  // Check required variables
  const required = [
    'VITE_MODE',
    'VITE_BASE_URL',
    'VITE_URL_AUTH'
  ]

  required.forEach(key => {
    const value = getEnvVar(key)
    if (!value) {
      errors.push(`Missing required environment variable: ${key}`)
    }
  })

  // Validate URLs
  const urls = [
    { key: 'VITE_BASE_URL', value: environment.api.baseUrl },
    { key: 'VITE_URL_AUTH', value: environment.api.authUrl },
    { key: 'VITE_CATALOGOS_URL', value: environment.api.catalogosUrl },
  ]

  urls.forEach(({ key, value }) => {
    if (value && !isValidUrl(value)) {
      errors.push(`Invalid URL format for ${key}: ${value}`)
    }
  })

  // Validate mode
  const validModes = ['desarrollo', 'staging', 'production']
  if (!validModes.includes(environment.mode)) {
    errors.push(`Invalid VITE_MODE: ${environment.mode}. Must be one of: ${validModes.join(', ')}`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Helper function to validate URLs
const isValidUrl = (string) => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

// Log environment configuration in development
if (environment.isDevelopment() && environment.debug.enabled) {
  console.group('🔧 Environment Configuration')
  console.log('Mode:', environment.mode)
  console.log('API Base URL:', environment.api.baseUrl)
  console.log('Auth URL:', environment.api.authUrl)
  console.log('Catalogos URL:', environment.api.catalogosUrl)
  console.log('Is Containerized:', environment.isContainerized())
  console.log('CORS Origins:', environment.cors.origins)
  console.groupEnd()

  // Validate environment
  const validation = validateEnvironment()
  if (!validation.isValid) {
    console.group('❌ Environment Validation Errors')
    validation.errors.forEach(error => console.error(error))
    console.groupEnd()
  } else {
    console.log('✅ Environment validation passed')
  }
}

export default environment
