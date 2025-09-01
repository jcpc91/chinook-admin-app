# Docker Build Optimization Guide

This document outlines the build optimizations implemented for the Chinook application containerization.

## Optimization Strategies Implemented

### 1. Multi-Stage Build Optimization

All Dockerfiles now use optimized multi-stage builds with the following structure:

- **Base Stage**: Common dependencies and system setup
- **Development Stage**: Full dependencies for development
- **Test Stage**: Testing environment with test dependencies
- **Production Stage**: Minimal production dependencies

### 2. Docker Layer Caching Strategies

#### Package Installation Caching
- Uses `--mount=type=cache,target=/root/.npm` for npm cache persistence
- Copies `package*.json` files first for better layer caching
- Uses `npm ci --prefer-offline --no-audit` for faster, reproducible installs

#### Build Context Optimization
- Optimized `.dockerignore` files to exclude unnecessary files
- Reduced build context size by excluding:
  - Development files (tests, documentation)
  - Build artifacts and caches
  - IDE and OS-specific files
  - Database files for backend services

### 3. Security Improvements

- Non-root user execution in all containers
- Proper file ownership with `--chown=nodejs:nodejs`
- Minimal system dependencies
- Use of `dumb-init` for proper signal handling

### 4. Image Size Optimization

#### Production Dependencies Only
- Uses `npm ci --omit=dev` for production builds
- Cleans npm cache after installation
- Excludes development dependencies from production images

#### Minimal Base Images
- Uses `node:24-alpine` for smaller image sizes
- Installs only necessary system packages
- Combines RUN commands to reduce layers

### 5. Build Performance Improvements

#### Optimized COPY Operations
- Configuration files copied before source code for better caching
- Source code copied last to maximize cache hits
- Uses multi-line ENV statements to reduce layers

#### Efficient Dependency Management
- Leverages npm cache mounting for faster rebuilds
- Uses `--prefer-offline` flag to use cached packages
- Skips audit checks during builds for speed

## Build Commands

### Development Builds
```bash
# Build with cache mount support (requires BuildKit)
docker build --target development -t chinook-web:dev web/
docker build --target development -t chinook-app:dev app/
docker build --target development -t chinook-auth:dev auth/
docker build --target development -t chinook-catalogos:dev catalogos/
```

### Production Builds
```bash
# Build optimized production images
docker build --target production -t chinook-web:prod web/
docker build --target production -t chinook-app:prod app/
docker build --target production -t chinook-auth:prod auth/
docker build --target production -t chinook-catalogos:prod catalogos/
```

### Test Builds
```bash
# Build test images for CI/CD
docker build --target test -t chinook-web:test web/
docker build --target test -t chinook-app:test app/
docker build --target test -t chinook-auth:test auth/
docker build --target test -t chinook-catalogos:test catalogos/
```

## Build Optimization Features

### 1. BuildKit Cache Mounts
All Dockerfiles use BuildKit cache mounts for npm dependencies:
```dockerfile
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit
```

### 2. Layer Optimization
- System dependencies installed in base stage
- Package files copied before source code
- Environment variables set efficiently
- Combined RUN commands where appropriate

### 3. Security Best Practices
- Non-root user execution
- Minimal attack surface
- Proper signal handling with dumb-init
- Secure file permissions

### 4. Production Optimizations
- Multi-stage builds for minimal production images
- Production-only dependencies
- Optimized nginx configuration for web service
- Health checks for all services

## Performance Metrics

### Expected Improvements
- **Build Time**: 30-50% faster due to cache optimization
- **Image Size**: 20-40% smaller production images
- **Security**: Non-root execution and minimal dependencies
- **Reliability**: Better signal handling and health checks

### Cache Efficiency
- npm cache persistence across builds
- Layer caching for unchanged dependencies
- Optimized build context reduces transfer time

## Best Practices for Developers

### 1. Use BuildKit
Enable BuildKit for cache mount support:
```bash
export DOCKER_BUILDKIT=1
# or
docker buildx build --target production -t image:tag .
```

### 2. Leverage Cache Mounts
The optimized Dockerfiles automatically use cache mounts when BuildKit is enabled.

### 3. Build Specific Targets
Build only the stage you need:
```bash
# Development
docker build --target development -t app:dev .

# Production
docker build --target production -t app:prod .

# Testing
docker build --target test -t app:test .
```

### 4. Monitor Build Performance
Use `docker build --progress=plain` to see detailed build output and identify bottlenecks.

## Troubleshooting

### Cache Issues
If experiencing cache issues:
```bash
# Clear BuildKit cache
docker builder prune

# Build without cache
docker build --no-cache --target production -t image:tag .
```

### Permission Issues
If encountering permission issues, ensure the non-root user has proper permissions:
```bash
# Check container user
docker run --rm image:tag id

# Run as root for debugging
docker run --rm --user root image:tag sh
```

### Build Context Size
Monitor build context size:
```bash
# Check .dockerignore effectiveness
docker build --progress=plain . 2>&1 | grep "transferring context"
```

## Future Optimizations

### 1. Distroless Images
Consider using distroless images for even smaller production images:
```dockerfile
FROM gcr.io/distroless/nodejs24-debian12 AS production
```

### 2. Multi-Architecture Builds
Support multiple architectures:
```bash
docker buildx build --platform linux/amd64,linux/arm64 -t image:tag .
```

### 3. Build Cache Optimization
Implement build cache sharing in CI/CD pipelines for faster builds across environments.