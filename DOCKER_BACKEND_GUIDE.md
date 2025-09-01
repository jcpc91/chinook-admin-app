# Backend Services Docker Guide

This guide explains the standardized Docker setup for Express.js backend services in the Chinook Admin App.

## Overview

All backend services (app, auth, catalogos) now use a standardized multi-stage Dockerfile that provides:

- **Development stage**: Includes all dependencies and nodemon for hot reload
- **Production stage**: Optimized with only production dependencies and non-root user
- **Health checks**: Built-in health monitoring for container orchestration
- **Security**: Non-root user execution in production

## Files Created

### Template
- `Dockerfile.backend.template` - Base template for creating service-specific Dockerfiles

### Service-Specific Dockerfiles
- `app/Dockerfile` - Chinook app service (port 3001)
- `auth/Dockerfile` - Authentication service (port 3000)  
- `catalogos/Dockerfile` - Catalog service (port 3002)

### Docker Ignore Files
- `app/.dockerignore` - Optimizes build context for app service
- `auth/.dockerignore` - Optimizes build context for auth service
- `catalogos/.dockerignore` - Optimizes build context for catalogos service

## Health Check Endpoints

All services now include `/health` endpoints that return:

```json
{
  "status": "OK",
  "service": "service-name",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "port": 3000
}
```

## Building Images

### Development Images
```bash
# Build development image for a service
cd app
docker build --target development -t app-dev .

cd auth  
docker build --target development -t auth-dev .

cd catalogos
docker build --target development -t catalogos-dev .
```

### Production Images
```bash
# Build production image for a service
cd app
docker build --target production -t app-prod .

cd auth
docker build --target production -t auth-prod .

cd catalogos  
docker build --target production -t catalogos-prod .
```

## Running Containers

### Development Mode
```bash
# Run with nodemon hot reload
docker run -p 3001:3001 -v $(pwd):/app app-dev
```

### Production Mode
```bash
# Run optimized production container
docker run -p 3001:3001 app-prod
```

## Key Features

### Multi-Stage Builds
- **Development**: Includes dev dependencies, nodemon, full toolchain
- **Production**: Minimal image with only runtime dependencies

### Security
- Production images run as non-root user (nodejs:nodejs)
- Minimal attack surface with Alpine Linux base

### Health Monitoring
- Docker health checks every 30 seconds
- Automatic container restart on health check failures
- Integration ready for Docker Compose orchestration

### Hot Reload Support
- Development containers support volume mounts for live code updates
- Nodemon automatically restarts on file changes

## Environment Variables

Each service supports these environment variables:

- `PORT` - Service port (defaults: auth=3000, app=3001, catalogos=3002)
- `CORS_ORIGIN` - Allowed CORS origins
- `JWT_SECREAT_KEY` - JWT signing secret
- `NODE_ENV` - Environment mode (development/staging/production)

## Package.json Scripts

All services now have standardized scripts:

```json
{
  "scripts": {
    "start": "node src/app.js",     // Production start
    "dev": "nodemon src/app.js",    // Development with hot reload
    "test": "..."                   // Service-specific tests
  }
}
```

## Next Steps

These Dockerfiles are ready for:

1. **Docker Compose Integration** - Use in multi-service orchestration
2. **Environment-Specific Deployment** - Development, staging, production
3. **CI/CD Pipelines** - Automated building and deployment
4. **Container Orchestration** - Kubernetes, Docker Swarm compatibility

## Troubleshooting

### Health Check Failures
- Ensure the service starts on the correct port
- Verify `/health` endpoint is accessible
- Check container logs: `docker logs <container-id>`

### Build Issues
- Verify `.dockerignore` excludes unnecessary files
- Check that `package.json` and `package-lock.json` exist
- Ensure source code is in `src/` directory

### Permission Issues
- Production containers run as non-root user
- Ensure file permissions allow nodejs user access
- Use `--chown=nodejs:nodejs` for copied files in production