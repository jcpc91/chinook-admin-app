# Web Service Containerization Guide

This document explains the containerization setup for the Vue.js web frontend service, including environment handling, CORS configuration, and deployment scenarios.

## Overview

The web service supports three deployment environments:
- **Development**: Web service containerized, backend services run locally
- **Staging**: All services fully containerized with PostgreSQL
- **Production**: All services fully containerized with security optimizations

## Environment Configuration

### Environment Variables

All environment variables use the `VITE_` prefix and are available at build time:

#### Core Configuration
- `VITE_MODE`: Environment mode (`desarrollo`, `staging`, `production`)
- `VITE_BASE_URL`: Main app service URL
- `VITE_URL_AUTH`: Authentication service URL
- `VITE_CATALOGOS_URL`: Catalogos service URL

#### Container Settings
- `VITE_PORT`: Development server port (default: 5173)
- `VITE_PREVIEW_PORT`: Preview server port (default: 4173)
- `VITE_USE_PROXY`: Enable Vite proxy for development (default: false)

#### CORS Configuration
- `VITE_CORS_ORIGIN`: Comma-separated list of allowed origins

#### API Settings
- `VITE_API_TIMEOUT`: API request timeout in milliseconds
- `VITE_AUTH_TIMEOUT`: Auth request timeout in milliseconds

#### Debug Settings
- `VITE_ENABLE_DEBUG`: Enable debug logging
- `VITE_LOG_LEVEL`: Logging level (`error`, `warn`, `info`, `debug`)

#### Security Settings (Production)
- `VITE_SECURE_COOKIES`: Enable secure cookies
- `VITE_ENABLE_HTTPS`: Enable HTTPS-specific features

### Environment Files

#### Development (`.env.development`)
```env
VITE_MODE=desarrollo
VITE_BASE_URL=http://host.docker.internal:3001
VITE_URL_AUTH=http://host.docker.internal:3000
VITE_CATALOGOS_URL=http://host.docker.internal:3002
VITE_CORS_ORIGIN=http://localhost:5173,http://host.docker.internal:5173
```

#### Staging (`.env.staging`)
```env
VITE_MODE=staging
VITE_BASE_URL=http://app:3001
VITE_URL_AUTH=http://auth:3000
VITE_CATALOGOS_URL=http://catalogos:3002
VITE_CORS_ORIGIN=http://web:5173
```

#### Production (`.env.production`)
```env
VITE_MODE=production
VITE_BASE_URL=http://app:3001
VITE_URL_AUTH=http://auth:3000
VITE_CATALOGOS_URL=http://catalogos:3002
VITE_CORS_ORIGIN=http://web:80
VITE_SECURE_COOKIES=true
VITE_ENABLE_HTTPS=true
```

## CORS Configuration

### Development Environment
- **Web Container**: Communicates with local backend services
- **CORS Origins**: `localhost:5173`, `host.docker.internal:5173`
- **Backend Access**: Via `host.docker.internal` networking

### Staging Environment
- **All Containerized**: Internal Docker network communication
- **CORS Origins**: `web:5173`
- **Service Discovery**: Container names (`app`, `auth`, `catalogos`)

### Production Environment
- **All Containerized**: Optimized for production deployment
- **CORS Origins**: `web:80`, `web:443` (HTTPS)
- **Security Headers**: Strict transport security, content type options

## Docker Configuration

### Multi-stage Dockerfile

The Dockerfile supports three stages:

1. **Development Stage**: Full development environment with hot reload
2. **Build Stage**: Optimized build process with environment injection
3. **Production Stage**: Nginx-based serving with security headers

### Build Arguments

Production builds accept these build arguments:
```dockerfile
ARG VITE_MODE=production
ARG VITE_BASE_URL=http://app:3001
ARG VITE_URL_AUTH=http://auth:3000
ARG VITE_CATALOGOS_URL=http://catalogos:3002
# ... additional arguments
```

## Docker Compose Integration

### Development (`docker-compose.dev.yml`)
```yaml
web:
  build:
    target: development
  ports:
    - "5173:5173"
  volumes:
    - ./web:/app
    - /app/node_modules
  extra_hosts:
    - "host.docker.internal:host-gateway"
```

### Staging (`docker-compose.staging.yml`)
```yaml
web:
  build:
    target: production
  ports:
    - "80:80"
  depends_on:
    - auth
    - app
    - catalogos
```

### Production (`docker-compose.prod.yml`)
```yaml
web:
  build:
    target: production
  ports:
    - "80:80"
    - "443:443"
  deploy:
    resources:
      limits:
        memory: 128M
```

## API Communication

### Service Discovery

The application automatically detects the environment and configures API endpoints:

```javascript
// Development: host.docker.internal for backend access
VITE_BASE_URL=http://host.docker.internal:3001

// Staging/Production: container names for internal communication
VITE_BASE_URL=http://app:3001
```

### Request Configuration

All API requests include:
- Environment-specific CORS headers
- Proper credentials handling
- Timeout configuration
- Error handling with service identification

### Health Checks

The application includes health check utilities:
```javascript
import { checkServiceHealth, checkAllServicesHealth } from '@/utils/api.js'

// Check individual service
const isHealthy = await checkServiceHealth('app')

// Check all services
const healthStatus = await checkAllServicesHealth()
```

## Environment Validation

### Automatic Validation

The application validates environment configuration on startup:
- Required environment variables
- URL format validation
- CORS configuration checks
- Security settings validation

### Manual Validation

Use the environment validator for debugging:
```javascript
import EnvironmentValidator from '@/utils/environment-validator.js'

const validator = new EnvironmentValidator()
const report = validator.generateReport()
```

## Development Workflow

### Starting Development Environment
```bash
# Start only web service containerized
docker-compose -f docker-compose.dev.yml up web

# Backend services run locally
cd app && npm run dev
cd auth && npm run dev
cd catalogos && npm run dev
```

### Hot Reload

Development containers support hot reload through volume mounts:
```yaml
volumes:
  - ./web:/app
  - /app/node_modules  # Preserve node_modules
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check `VITE_CORS_ORIGIN` configuration
2. **Service Unreachable**: Verify service URLs and container networking
3. **Build Failures**: Ensure all required environment variables are set
4. **Hot Reload Not Working**: Check volume mount configuration

### Debug Mode

Enable debug logging for detailed information:
```env
VITE_ENABLE_DEBUG=true
VITE_LOG_LEVEL=debug
```

### Health Check Endpoints

All services provide health check endpoints:
- Web: `http://web:5173/` (development) or `http://web:80/` (production)
- Backend services: `http://service:port/health`

## Security Considerations

### Production Security

- Secure cookies enabled
- HTTPS enforcement
- Security headers configured
- No debug information exposed
- Minimal container attack surface

### Environment Isolation

- Development: Isolated web container with local backend access
- Staging: Full isolation with internal networking
- Production: Secure isolation with resource limits

## Performance Optimization

### Container Optimization

- Multi-stage builds minimize image size
- Nginx serving for production performance
- Resource limits prevent resource exhaustion
- Health checks ensure service availability

### Build Optimization

- Layer caching for faster builds
- Dependency optimization
- Asset compression and caching
- Environment-specific optimizations