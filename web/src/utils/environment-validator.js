/**
 * Environment validation utility for containerized deployments
 * Validates configuration and provides helpful error messages
 */

import { environment as config } from '@/config/environment.js'
import containerConfig from '@/config/container.js'

export class EnvironmentValidator {
  constructor() {
    this.errors = []
    this.warnings = []
  }

  // Validate all environment configuration
  validateAll() {
    this.validateBasicConfig()
    this.validateApiEndpoints()
    this.validateCorsConfiguration()
    this.validateContainerSettings()
    this.validateSecuritySettings()

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    }
  }

  // Validate basic configuration
  validateBasicConfig() {
    if (!config.mode) {
      this.errors.push('VITE_MODE is not set')
    } else if (!['desarrollo', 'staging', 'production'].includes(config.mode)) {
      this.errors.push(`Invalid VITE_MODE: ${config.mode}. Must be one of: desarrollo, staging, production`)
    }

    if (!config.container.port || config.container.port < 1 || config.container.port > 65535) {
      this.errors.push('VITE_PORT must be a valid port number (1-65535)')
    }

    if (!config.container.previewPort || config.container.previewPort < 1 || config.container.previewPort > 65535) {
      this.errors.push('VITE_PREVIEW_PORT must be a valid port number (1-65535)')
    }
  }

  // Validate API endpoints
  validateApiEndpoints() {
    const endpoints = [
      { name: 'VITE_BASE_URL', url: config.api.baseUrl },
      { name: 'VITE_URL_AUTH', url: config.api.authUrl },
      { name: 'VITE_CATALOGOS_URL', url: config.api.catalogosUrl },
    ]

    endpoints.forEach(({ name, url }) => {
      if (!url) {
        this.errors.push(`${name} is not configured`)
      } else if (!this.isValidUrl(url)) {
        this.errors.push(`${name} is not a valid URL: ${url}`)
      } else if (config.isProduction && url.startsWith('http://')) {
        this.warnings.push(`${name} uses HTTP in production environment: ${url}`)
      }
    })
  }

  // Validate CORS configuration
  validateCorsConfiguration() {
    const corsSettings = config.getCorsSettings()

    if (!corsSettings.origin || corsSettings.origin.length === 0) {
      this.errors.push('CORS origins are not configured')
    }

    if (config.isProduction) {
      const hasSecureOrigins = corsSettings.origin.some(origin =>
        origin.startsWith('https://') || origin === 'http://localhost'
      )

      if (!hasSecureOrigins) {
        this.warnings.push('Production environment should use HTTPS origins')
      }
    }

    // Check for wildcard origins in production
    if (config.isProduction && corsSettings.origin.includes('*')) {
      this.errors.push('Wildcard CORS origins are not allowed in production')
    }
  }

  // Validate container-specific settings
  validateContainerSettings() {
    if (config.isDevelopment) {
      // Development-specific validations
      const devUrls = [config.api.baseUrl, config.api.authUrl]
      const hasHostDockerInternal = devUrls.some(url =>
        url.includes('host.docker.internal')
      )

      if (!hasHostDockerInternal) {
        this.warnings.push('Development environment should use host.docker.internal for backend services')
      }
    } else {
      // Staging/Production validations
      const prodUrls = [config.api.baseUrl, config.api.authUrl, config.api.catalogosUrl]
      const hasContainerNames = prodUrls.every(url =>
        url.includes('app:') || url.includes('auth:') || url.includes('catalogos:')
      )

      if (!hasContainerNames) {
        this.warnings.push('Staging/Production should use container service names for internal communication')
      }
    }
  }

  // Validate security settings
  validateSecuritySettings() {
    if (config.isProduction) {
      if (!config.security.secureCookies) {
        this.errors.push('Secure cookies must be enabled in production')
      }

      if (config.debug.enabled) {
        this.warnings.push('Debug mode should be disabled in production')
      }

      if (config.debug.logLevel === 'debug' || config.debug.logLevel === 'trace') {
        this.warnings.push('Log level should not be debug/trace in production')
      }
    }

    // Check timeout values
    if (config.timeouts.api < 5000) {
      this.warnings.push('API timeout is very low, consider increasing for production')
    }

    if (config.timeouts.auth < 3000) {
      this.warnings.push('Auth timeout is very low, consider increasing for production')
    }
  }

  // Helper method to validate URLs
  isValidUrl(string) {
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }

  // Generate validation report
  generateReport() {
    const result = this.validateAll()

    console.group('🔍 Environment Validation Report')
    console.log(`Environment: ${config.mode}`)
    console.log(`Container Mode: ${containerConfig.isContainerized() ? 'Yes' : 'No'}`)

    if (result.errors.length > 0) {
      console.group('❌ Errors')
      result.errors.forEach(error => console.error(`• ${error}`))
      console.groupEnd()
    }

    if (result.warnings.length > 0) {
      console.group('⚠️ Warnings')
      result.warnings.forEach(warning => console.warn(`• ${warning}`))
      console.groupEnd()
    }

    if (result.isValid && result.warnings.length === 0) {
      console.log('✅ All validations passed')
    }

    console.groupEnd()

    return result
  }

  // Quick validation for startup
  static quickValidate() {
    const validator = new EnvironmentValidator()
    const result = validator.validateAll()

    if (!result.isValid) {
      console.error('❌ Environment validation failed:', result.errors)
      return false
    }

    if (result.warnings.length > 0) {
      console.warn('⚠️ Environment warnings:', result.warnings)
    }

    return true
  }
}

export default EnvironmentValidator
