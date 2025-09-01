/**
 * Container-specific configuration for Docker environments
 * Handles service discovery, health checks, and container networking
 */

import { environment as config } from './environment.js'

export const containerConfig = {
  // Service discovery configuration
  services: {
    web: {
      name: 'web',
      port: 5173,
      healthPath: '/',
      containerName: 'web',
    },
    app: {
      name: 'app',
      port: 3001,
      healthPath: '/health',
      containerName: 'app',
    },
    auth: {
      name: 'auth',
      port: 3000,
      healthPath: '/health',
      containerName: 'auth',
    },
    catalogos: {
      name: 'catalogos',
      port: 3002,
      healthPath: '/health',
      containerName: 'catalogos',
    },
    postgres: {
      name: 'postgres',
      port: 5432,
      healthPath: null,
      containerName: 'postgres',
    },
  },

  // Network configuration for different environments
  networks: {
    development: {
      // Development: web containerized, backends local
      webToBackend: 'host.docker.internal',
      backendToBackend: 'localhost',
      backendToDb: 'localhost',
    },
    staging: {
      // Staging: all services containerized
      webToBackend: 'container',
      backendToBackend: 'container',
      backendToDb: 'postgres',
    },
    production: {
      // Production: all services containerized
      webToBackend: 'container',
      backendToBackend: 'container',
      backendToDb: 'postgres',
    },
  },

  // Get service URL based on environment and service name
  getServiceUrl(serviceName, environment = config.mode) {
    const service = this.services[serviceName]
    if (!service) {
      throw new Error(`Unknown service: ${serviceName}`)
    }

    const network = this.networks[environment] || this.networks.development

    // For development environment with mixed local/container setup
    if (environment === 'desarrollo' || environment === 'development') {
      if (serviceName === 'web') {
        return `http://localhost:${service.port}`
      } else {
        // Backend services run locally in development
        return `http://${network.webToBackend}:${service.port}`
      }
    }

    // For staging/production with full containerization
    return `http://${service.containerName}:${service.port}`
  },

  // Get all service URLs for current environment
  getAllServiceUrls(environment = config.mode) {
    const urls = {}
    Object.keys(this.services).forEach(serviceName => {
      if (serviceName !== 'postgres') { // Skip database service
        urls[serviceName] = this.getServiceUrl(serviceName, environment)
      }
    })
    return urls
  },

  // Check if running in containerized environment
  isContainerized() {
    // Check for common container environment indicators
    return (
      process.env.DOCKER_CONTAINER === 'true' ||
      process.env.KUBERNETES_SERVICE_HOST ||
      process.env.HOSTNAME?.startsWith('web-') ||
      config.mode === 'staging' ||
      config.mode === 'production'
    )
  },

  // Get container-specific CORS origins
  getCorsOrigins(environment = config.mode) {
    if (environment === 'desarrollo' || environment === 'development') {
      return [
        'http://localhost:5173',
        'http://host.docker.internal:5173',
        'http://127.0.0.1:5173',
      ]
    }

    if (environment === 'staging') {
      return [
        'http://web:5173',
        'http://localhost:80',
      ]
    }

    // Production
    return [
      'http://web:80',
      'https://web:443',
    ]
  },

  // Validate container environment
  validateEnvironment() {
    const errors = []
    const environment = config.mode

    // Check if required environment variables are set
    const requiredVars = ['VITE_MODE', 'VITE_BASE_URL', 'VITE_URL_AUTH']
    requiredVars.forEach(varName => {
      if (!import.meta.env[varName]) {
        errors.push(`Missing required environment variable: ${varName}`)
      }
    })

    // Validate service URLs
    try {
      const urls = this.getAllServiceUrls(environment)
      Object.entries(urls).forEach(([service, url]) => {
        if (!url || !url.startsWith('http')) {
          errors.push(`Invalid URL for service ${service}: ${url}`)
        }
      })
    } catch (error) {
      errors.push(`Service URL validation failed: ${error.message}`)
    }

    // Environment-specific validations
    if (environment === 'production') {
      if (!config.security.secureCookies) {
        errors.push('Secure cookies should be enabled in production')
      }
    }

    if (errors.length > 0) {
      console.error('Container environment validation errors:', errors)
      return false
    }

    return true
  },

  // Log container configuration
  logConfiguration() {
    if (config.debug.enabled || config.isDevelopment) {
      console.log('Container Configuration:', {
        environment: config.mode,
        isContainerized: this.isContainerized(),
        serviceUrls: this.getAllServiceUrls(),
        corsOrigins: this.getCorsOrigins(),
        network: this.networks[config.mode] || this.networks.development,
      })
    }
  },
}

// Validate and log configuration on import
containerConfig.validateEnvironment()
containerConfig.logConfiguration()

export default containerConfig
