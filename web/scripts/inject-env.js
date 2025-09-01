#!/usr/bin/env node

/**
 * Environment Variable Injection Script
 * This script injects environment variables into the built application
 * for containerized deployments where build-time variables may not be sufficient
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Get environment variables with VITE_ prefix
const getViteEnvVars = () => {
  const viteVars = {}

  Object.keys(process.env).forEach(key => {
    if (key.startsWith('VITE_')) {
      viteVars[key] = process.env[key]
    }
  })

  return viteVars
}

// Generate JavaScript code to inject environment variables
const generateEnvScript = (envVars) => {
  const assignments = Object.entries(envVars)
    .map(([key, value]) => `window.__${key}__ = ${JSON.stringify(value)};`)
    .join('\n  ')

  return `
// Environment variables injected at container startup
(function() {
  'use strict';

  // Inject VITE_ environment variables
  ${assignments}

  // Mark as injected
  window.__ENV_INJECTED__ = true;

  console.log('🔧 Environment variables injected for containerized deployment');
})();
`
}

// Main injection function
const injectEnvironmentVariables = () => {
  const distPath = path.join(__dirname, '..', 'dist')
  const indexPath = path.join(distPath, 'index.html')
  const envScriptPath = path.join(distPath, 'env-config.js')

  // Check if dist directory exists
  if (!fs.existsSync(distPath)) {
    console.error('❌ Dist directory not found. Make sure to build the application first.')
    process.exit(1)
  }

  // Check if index.html exists
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html not found in dist directory.')
    process.exit(1)
  }

  try {
    // Get environment variables
    const envVars = getViteEnvVars()

    if (Object.keys(envVars).length === 0) {
      console.log('⚠️  No VITE_ environment variables found to inject.')
      return
    }

    // Generate environment script
    const envScript = generateEnvScript(envVars)

    // Write environment script file
    fs.writeFileSync(envScriptPath, envScript)

    // Read index.html
    let indexContent = fs.readFileSync(indexPath, 'utf8')

    // Check if script is already injected
    if (indexContent.includes('env-config.js')) {
      console.log('✅ Environment variables already injected.')
      return
    }

    // Inject script tag before closing head tag
    const scriptTag = '  <script src="/env-config.js"></script>\n</head>'
    indexContent = indexContent.replace('</head>', scriptTag)

    // Write updated index.html
    fs.writeFileSync(indexPath, indexContent)

    console.log('✅ Environment variables injected successfully:')
    Object.entries(envVars).forEach(([key, value]) => {
      // Mask sensitive values
      const displayValue = key.toLowerCase().includes('secret') ||
                          key.toLowerCase().includes('password') ||
                          key.toLowerCase().includes('key')
        ? '***MASKED***'
        : value
      console.log(`   ${key}=${displayValue}`)
    })

  } catch (error) {
    console.error('❌ Error injecting environment variables:', error.message)
    process.exit(1)
  }
}

// Export for testing
export { injectEnvironmentVariables, getViteEnvVars, generateEnvScript }

// Run if called directly
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])

if (isMainModule) {
  injectEnvironmentVariables()
}
