import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import "chance";

// Import environment configuration and validation
import { environment as config } from '@/config/environment.js'
import EnvironmentValidator from '@/utils/environment-validator.js'

// Validate environment configuration on startup
const validationResult = EnvironmentValidator.quickValidate()

if (!validationResult) {
  console.error('❌ Application startup failed due to environment configuration errors')
  // In development, show detailed report
  if (config.isDevelopment) {
    const validator = new EnvironmentValidator()
    validator.generateReport()
  }
}

const app = createApp(App)

const pinia = createPinia()

// Log environment info in development
if (config.isDevelopment || config.debug.enabled) {
  console.log('🚀 Application starting with environment:', {
    mode: config.mode,
    apiUrls: config.getApiUrls(),
    corsSettings: config.getCorsSettings(),
    debug: config.debug,
  })
}

app.use(pinia)
app.use(router)

app.mount('#app')
