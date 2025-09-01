# Environment Configuration Guide

This document explains how environment variables are handled in the containerized web service for different deployment scenarios.

## Overview

The web service supports three deployment modes:
- **Development**: Web containerized, backend services run locally
- **Staging**: Full containerization with PostgreSQL
- **Production**: Optimized containerized deployment

## Environment Variable Injection

### Build-time Injection
Environment variables are injected during the Docker build process using build arguments:

```dockerfile
ARG VITE_MODE=production
ARG VITE_BASE_URL=http://app:3001
ENV VITE_MODE=$VITE_MODE
ENV VITE_BASE_URL=$VITE_BASE_URL
```

### Runtime Injection
For dynamic configuration, environment variables are injected at container startup using the `inject-env.js` script:

```bash
# Automatically runs during container startup
node /usr/local/bin/inject-env.js
```

This creates an `env-config.js` file that's loaded by the application.

## Environment Files

### Development (.env.development)
```bash
VITE_MODE=desarrollo
VITE_BASE_URL=http://host.docker.internal:3001
VITE_URL_AUTH=http://host.docker.internal:3000
VITE_CORS_ORIGIN=http://localhost:5173,http://host.docker.internal:5173
```

### Staging (.env.staging)
```bash
VITE_MODE=staging
VITE_BASE_URL=http://app:3001
VITE_URL_AUTH=http://auth:3000
VITE_CATALOGOS_URL=http://catalogos:3002
VITE_CORS_ORIGIN=http://web:5173
```

### Production (.env.production)
```bash
VITE_MODE=production
VITE_BASE_URL=http://app:3001
VITE_URL_AUTH=http://auth:3000
VITE_CATALOGOS_URL=http://catalogos:3002
VITE_CORS_ORIGIN=http://web:80,https://web:443
VITE_SECURE_COOKIES=true
VITE_ENABLE_HTTPS=true
```

## Docker Compose Integration

Environment variables are passed through Docker Compose using the `.env` file:

```yaml
environment:
  - VITE_MODE=${VITE_MODE_STAGING:-staging}
  - VITE_BASE_URL=${VITE_BASE_URL_STAGING:-http://app:3001}
  - VITE_URL_AUTH=${VITE_URL_AUTH_STAGING:-http://auth:3000}
```

## CORS Configuration

### Development
- Allows localhost and host.docker.internal origins
- Supports both containerized web and local backend services

### Staging/Production
- Configured for internal Docker network communication
- Supports service-to-service communication

## Available Environment Variables

### Required Variables
- `VITE_MODE`: Application mode (desarrollo/staging/production)
- `VITE_BASE_URL`: Main API endpoint
- `VITE_URL_AUTH`: Authentication service endpoint
- `VITE_PORT`: Web service port

### Optional Variables
- `VITE_CATALOGOS_URL`: Catalog service endpoint
- `VITE_CORS_ORIGIN`: Comma-separated CORS origins
- `VITE_API_TIMEOUT`: API request timeout (ms)
- `VITE_AUTH_TIMEOUT`: Auth request timeout (ms)
- `VITE_ENABLE_DEBUG`: Enable debug logging
- `VITE_LOG_LEVEL`: Logging level (error/warn/info/debug)
- `VITE_SECURE_COOKIES`: Enable secure cookies
- `VITE_ENABLE_HTTPS`: Enable HTTPS mode

## Validation

### Automatic Validation
Environment variables are automatically validated during:
- Build process
- Container startup
- Development server start

### Manual Validation
```bash
# Validate current environment
npm run env:validate

# Validate specific environment file
npm run env:validate:dev
npm run env:validate:staging
npm run env:validate:prod
```

## Usage in Application

### Using the Environment Utility
```javascript
import { environment } from '@/config/environment'

// Access configuration
const apiUrl = environment.api.baseUrl
const isProduction = environment.isProduction()
const isContainerized = environment.isContainerized()

// Check CORS origins
const corsOrigins = environment.cors.origins
```

### Direct Access
```javascript
// Access injected variables directly
const mode = window.__VITE_MODE__ || import.meta.env.VITE_MODE
const apiUrl = window.__VITE_BASE_URL__ || import.meta.env.VITE_BASE_URL
```

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Check `.env` file exists and contains required variables
   - Verify Docker Compose environment section
   - Run validation script: `npm run env:validate`

2. **CORS Errors**
   - Verify `VITE_CORS_ORIGIN` includes all necessary origins
   - Check nginx configuration for CORS headers
   - Ensure backend services have matching CORS settings

3. **Container Communication Issues**
   - Verify service names match Docker Compose service definitions
   - Check network configuration in Docker Compose
   - Ensure services are in the same Docker network

### Debug Mode
Enable debug mode to see detailed environment information:

```bash
VITE_ENABLE_DEBUG=true
VITE_LOG_LEVEL=debug
```

This will log:
- Environment configuration on startup
- CORS origins
- Container detection status
- Validation results

## Best Practices

1. **Use Environment-Specific Files**
   - Keep separate `.env.*` files for each environment
   - Use Docker Compose variable substitution

2. **Validate Configuration**
   - Always run validation before deployment
   - Include validation in CI/CD pipelines

3. **Secure Sensitive Data**
   - Use Docker secrets for production
   - Never commit sensitive values to version control
   - Use environment variable substitution

4. **Test Container Communication**
   - Verify service-to-service communication
   - Test CORS configuration
   - Validate health checks

## Scripts Reference

```bash
# Environment validation
npm run env:validate              # Validate current environment
npm run env:validate:dev          # Validate development config
npm run env:validate:staging      # Validate staging config
npm run env:validate:prod         # Validate production config

# Environment injection
npm run env:inject                # Inject variables into built app

# Build with validation
npm run build:dev                 # Build for development
npm run build:staging             # Build for staging
npm run build:prod                # Build for production
```