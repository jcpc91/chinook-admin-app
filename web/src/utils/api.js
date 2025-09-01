/**
 * API utility functions for containerized environment
 * Handles environment-specific API calls with proper CORS configuration
 */

import { environment as config } from '@/config/environment.js'

/**
 * Create a fetch wrapper with environment-specific configuration
 * @param {string} url - The API endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise} - Fetch promise with configured options
 */
export async function apiRequest(url, options = {}) {
  const fetchConfig = config.getFetchConfig()
  const apiUrls = config.getApiUrls()

  // Determine which service this request is for based on URL
  let baseUrl = ''
  let serviceName = 'app'

  if (url.startsWith('/auth') || url.includes('auth')) {
    baseUrl = apiUrls.auth
    serviceName = 'auth'
  } else if (url.startsWith('/catalogos') || url.includes('catalogos')) {
    baseUrl = apiUrls.catalogos
    serviceName = 'catalogos'
  } else {
    baseUrl = apiUrls.app
    serviceName = 'app'
  }

  // Construct full URL
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`

  // Get environment-specific CORS headers
  const corsSettings = config.getCorsSettings()

  // Merge configurations with environment-specific headers
  const requestOptions = {
    ...fetchConfig,
    ...options,
    headers: {
      ...fetchConfig.headers,
      ...corsSettings.headers,
      ...options.headers,
    },
  }

  // Add timeout handling
  const timeout = serviceName === 'auth' ? config.timeouts.auth : config.timeouts.api
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    // Log request details in development
    if (config.debug.enabled) {
      console.log(`API Request [${serviceName}]:`, {
        url: fullUrl,
        method: requestOptions.method || 'GET',
        headers: requestOptions.headers,
        mode: requestOptions.mode,
        credentials: requestOptions.credentials,
      })
    }

    const response = await fetch(fullUrl, {
      ...requestOptions,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Log response details in development
    if (config.debug.enabled) {
      console.log(`API Response [${serviceName}]:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      })
    }

    if (!response.ok) {
      const errorMessage = `HTTP error! status: ${response.status} for ${serviceName} service`

      // Try to get error details from response
      try {
        const errorData = await response.json()
        throw new Error(`${errorMessage} - ${errorData.message || errorData.error || 'Unknown error'}`)
      } catch {
        throw new Error(errorMessage)
      }
    }

    return response
  } catch (error) {
    clearTimeout(timeoutId)

    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms for ${serviceName} service`)
    }

    // Enhanced error handling for containerized environments
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(`Network error connecting to ${serviceName} service. Check if the service is running and accessible.`)
    }

    throw error
  }
}

/**
 * GET request wrapper
 * @param {string} url - The API endpoint URL
 * @param {object} options - Additional fetch options
 * @returns {Promise} - Response data
 */
export async function apiGet(url, options = {}) {
  const response = await apiRequest(url, {
    method: 'GET',
    ...options,
  })
  return response.json()
}

/**
 * POST request wrapper
 * @param {string} url - The API endpoint URL
 * @param {object} data - Request body data
 * @param {object} options - Additional fetch options
 * @returns {Promise} - Response data
 */
export async function apiPost(url, data, options = {}) {
  const response = await apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  })
  return response.json()
}

/**
 * PUT request wrapper
 * @param {string} url - The API endpoint URL
 * @param {object} data - Request body data
 * @param {object} options - Additional fetch options
 * @returns {Promise} - Response data
 */
export async function apiPut(url, data, options = {}) {
  const response = await apiRequest(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  })
  return response.json()
}

/**
 * DELETE request wrapper
 * @param {string} url - The API endpoint URL
 * @param {object} options - Additional fetch options
 * @returns {Promise} - Response data
 */
export async function apiDelete(url, options = {}) {
  const response = await apiRequest(url, {
    method: 'DELETE',
    ...options,
  })
  return response.json()
}

/**
 * Health check utility for services
 * @param {string} service - Service name (app, auth, catalogos)
 * @returns {Promise<boolean>} - Service health status
 */
export async function checkServiceHealth(service) {
  try {
    const apiUrls = config.getApiUrls()
    const serviceUrl = apiUrls[service]

    if (!serviceUrl) {
      throw new Error(`Unknown service: ${service}`)
    }

    const response = await apiRequest(`${serviceUrl}/health`, {
      method: 'GET',
    })

    return response.ok
  } catch (error) {
    console.error(`Health check failed for ${service}:`, error)
    return false
  }
}

/**
 * Check all services health
 * @returns {Promise<object>} - Health status for all services
 */
export async function checkAllServicesHealth() {
  const services = ['app', 'auth', 'catalogos']
  const healthChecks = await Promise.allSettled(
    services.map(service => checkServiceHealth(service))
  )

  const results = {}
  services.forEach((service, index) => {
    results[service] = healthChecks[index].status === 'fulfilled'
      ? healthChecks[index].value
      : false
  })

  return results
}

export default {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  checkServiceHealth,
  checkAllServicesHealth,
}
