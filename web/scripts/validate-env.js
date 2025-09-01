#!/usr/bin/env node

/**
 * Environment Validation Script
 * Validates environment variables for containerized deployments
 * and provides helpful error messages for missing or invalid configurations
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Required environment variables by environment
const REQUIRED_VARS = {
  desarrollo: [
    'VITE_MODE',
    'VITE_BASE_URL',
    'VITE_URL_AUTH',
    'VITE_PORT'
  ],
  staging: [
    'VITE_MODE',
    'VITE_BASE_URL',
    'VITE_URL_AUTH',
    'VITE_CATALOGOS_URL',
    'VITE_PORT',
    'VITE_CORS_ORIGIN'
  ],
  production: [
    'VITE_MODE',
    'VITE_BASE_URL',
    'VITE_URL_AUTH',
    'VITE_CATALOGOS_URL',
    'VITE_PORT',
    'VITE_CORS_ORIGIN',
    'VITE_SECURE_COOKIES',
    'VITE_ENABLE_HTTPS'
  ]
}

// Default values for optional variables
const DEFAULT_VALUES = {
  VITE_PORT: '5173',
  VITE_PREVIEW_PORT: '4173',
  VITE_USE_PROXY: 'false',
  VITE_API_TIMEOUT: '10000',
  VITE_AUTH_TIMEOUT: '5000',
  VITE_ENABLE_DEBUG: 'false',
  VITE_LOG_LEVEL: 'info',
  VITE_SECURE_COOKIES: 'false',
  VITE_ENABLE_HTTPS: 'false'
}

// Validation rules
const VALIDATION_RULES = {
  VITE_MODE: {
    type: 'enum',
    values: ['desarrollo', 'staging', 'production'],
    message: 'Must be one of: desarrollo, staging, production'
  },
  VITE_PORT: {
    type: 'number',
    min: 1024,
    max: 65535,
    message: 'Must be a valid port number between 1024 and 65535'
  },
  VITE_PREVIEW_PORT: {
    type: 'number',
    min: 1024,
    max: 65535,
    message: 'Must be a valid port number between 1024 and 65535'
  },
  VITE_BASE_URL: {
    type: 'url',
    message: 'Must be a valid URL'
  },
  VITE_URL_AUTH: {
    type: 'url',
    message: 'Must be a valid URL'
  },
  VITE_CATALOGOS_URL: {
    type: 'url',
    message: 'Must be a valid URL'
  },
  VITE_API_TIMEOUT: {
    type: 'number',
    min: 1000,
    max: 60000,
    message: 'Must be a number between 1000 and 60000 milliseconds'
  },
  VITE_AUTH_TIMEOUT: {
    type: 'number',
    min: 1000,
    max: 60000,
    message: 'Must be a number between 1000 and 60000 milliseconds'
  },
  VITE_USE_PROXY: {
    type: 'boolean',
    message: 'Must be true or false'
  },
  VITE_ENABLE_DEBUG: {
    type: 'boolean',
    message: 'Must be true or false'
  },
  VITE_LOG_LEVEL: {
    type: 'enum',
    values: ['error', 'warn', 'info', 'debug'],
    message: 'Must be one of: error, warn, info, debug'
  },
  VITE_SECURE_COOKIES: {
    type: 'boolean',
    message: 'Must be true or false'
  },
  VITE_ENABLE_HTTPS: {
    type: 'boolean',
    message: 'Must be true or false'
  }
}

// Validation functions
const validators = {
  enum: (value, rule) => rule.values.includes(value),
  number: (value, rule) => {
    const num = parseInt(value, 10)
    if (isNaN(num)) return false
    if (rule.min !== undefined && num < rule.min) return false
    if (rule.max !== undefined && num > rule.max) return false
    return true
  },
  url: (value) => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },
  boolean: (value) => value === 'true' || value === 'false'
}

// Load environment variables from file
const loadEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return {}
  }

  const content = fs.readFileSync(filePath, 'utf8')
  const vars = {}

  content.split('\n').forEach(line => {
    line = line.trim()
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        vars[key.trim()] = valueParts.join('=').trim()
      }
    }
  })

  return vars
}

// Get all environment variables (process.env + file)
const getAllEnvVars = (envFile) => {
  const fileVars = envFile ? loadEnvFile(envFile) : {}
  const processVars = {}

  // Get VITE_ variables from process.env
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('VITE_')) {
      processVars[key] = process.env[key]
    }
  })

  // Merge with file variables taking precedence
  return { ...processVars, ...fileVars }
}

// Validate environment variables
const validateEnvironment = (envVars, mode) => {
  const errors = []
  const warnings = []

  // Check required variables
  const required = REQUIRED_VARS[mode] || REQUIRED_VARS.desarrollo
  required.forEach(key => {
    if (!envVars[key]) {
      errors.push(`Missing required variable: ${key}`)
    }
  })

  // Validate all present variables
  Object.entries(envVars).forEach(([key, value]) => {
    if (key.startsWith('VITE_') && VALIDATION_RULES[key]) {
      const rule = VALIDATION_RULES[key]
      const validator = validators[rule.type]

      if (validator && !validator(value, rule)) {
        errors.push(`Invalid value for ${key}: ${value}. ${rule.message}`)
      }
    }
  })

  // Check for missing optional variables with defaults
  Object.entries(DEFAULT_VALUES).forEach(([key, defaultValue]) => {
    if (!envVars[key]) {
      warnings.push(`Using default value for ${key}: ${defaultValue}`)
      envVars[key] = defaultValue
    }
  })

  // Environment-specific validations
  if (mode === 'production') {
    if (envVars.VITE_ENABLE_DEBUG === 'true') {
      warnings.push('Debug mode is enabled in production')
    }

    if (envVars.VITE_SECURE_COOKIES === 'false') {
      warnings.push('Secure cookies are disabled in production')
    }
  }

  // Container-specific validations
  const isContainerized = envVars.VITE_BASE_URL?.includes('host.docker.internal') ||
                         envVars.VITE_BASE_URL?.includes(':3001') ||
                         envVars.VITE_URL_AUTH?.includes(':3000')

  if (isContainerized && !envVars.VITE_CORS_ORIGIN) {
    warnings.push('CORS origins not configured for containerized deployment')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    envVars
  }
}

// Main validation function
const main = () => {
  const args = process.argv.slice(2)
  const envFile = args[0]
  const mode = args[1] || process.env.VITE_MODE || 'desarrollo'

  console.log('🔍 Validating environment configuration...')
  console.log(`Mode: ${mode}`)
  if (envFile) {
    console.log(`Environment file: ${envFile}`)
  }
  console.log('')

  try {
    const envVars = getAllEnvVars(envFile)
    const validation = validateEnvironment(envVars, mode)

    // Display results
    if (validation.warnings.length > 0) {
      console.log('⚠️  Warnings:')
      validation.warnings.forEach(warning => console.log(`   ${warning}`))
      console.log('')
    }

    if (validation.errors.length > 0) {
      console.log('❌ Validation Errors:')
      validation.errors.forEach(error => console.log(`   ${error}`))
      console.log('')
      console.log('Please fix the above errors before proceeding.')
      process.exit(1)
    }

    console.log('✅ Environment validation passed!')
    console.log('')
    console.log('Configuration summary:')

    // Display key configuration values
    const keyVars = [
      'VITE_MODE',
      'VITE_BASE_URL',
      'VITE_URL_AUTH',
      'VITE_CATALOGOS_URL',
      'VITE_CORS_ORIGIN'
    ]

    keyVars.forEach(key => {
      if (validation.envVars[key]) {
        console.log(`   ${key}=${validation.envVars[key]}`)
      }
    })

  } catch (error) {
    console.error('❌ Error during validation:', error.message)
    process.exit(1)
  }
}

// Export for testing
export {
  validateEnvironment,
  loadEnvFile,
  getAllEnvVars,
  REQUIRED_VARS,
  DEFAULT_VALUES,
  VALIDATION_RULES
}

// Run if called directly
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])

if (isMainModule) {
  main()
}
