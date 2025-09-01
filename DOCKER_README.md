# Docker Configuration Guide

This document explains the Docker containerization setup for the Chinook music database administration application.

## Architecture Overview

The application uses different containerization strategies per environment:

- **Development**: Only web frontend containerized, backend services run locally
- **Staging**: Full containerization with PostgreSQL database
- **Production**: Optimized containerization with resource limits and security settings

## Docker Compose Files

### `docker-compose.yml` (Default - Development)
- Only containerizes the web frontend service
- Backend services run locally for easier debugging
- Uses SQLite database files from local `.db/` directory

### `docker-compose.dev.yml` (Explicit Development)
- Same as default configuration
- Explicit development settings with no restart policies

### `docker-compose.staging.yml` (Staging Environment)
- Full containerization of all services
- PostgreSQL database container
- Health checks and service dependencies
- Staging-specific environment variables

### `docker-compose.prod.yml` (Production Environment)
- Production-optimized configuration
- Resource limits and logging configuration
- Security settings and restart policies
- Production environment variables

## Environment Variables

### Root Level Templates
- `.env.development.template` - Development environment settings
- `.env.staging.template` - Staging environment settings  
- `.env.production.template` - Production environment settings

### Service Level Templates
Each service directory contains a `.env.template` file with service-specific configuration options.

## Usage

### Development (Default)
```bash
# Start only web service in container, backends run locally
docker-compose up

# Or explicitly use development configuration
docker-compose -f docker-compose.dev.yml up
```

### Staging
```bash
# Copy and configure environment variables
cp .env.staging.template .env.staging
# Edit .env.staging with your values

# Start all services with PostgreSQL
docker-compose -f docker-compose.staging.yml up
```

### Production
```bash
# Copy and configure environment variables
cp .env.production.template .env.production
# Edit .env.production with your values

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

## Service Configuration

### Web Service (Vue.js)
- **Development**: Containerized with hot reload via volume mounts
- **Production**: Multi-stage build with optimized production bundle
- **Ports**: 5173 (dev), 80 (prod)

### Backend Services (Express.js)
- **Development**: Run locally (not containerized)
- **Staging/Production**: Containerized with health checks
- **Ports**: 3000 (auth), 3001 (app), 3002 (catalogos)

### Database
- **Development**: Local SQLite files in `.db/` directory
- **Staging/Production**: PostgreSQL container with persistent volumes

## Health Checks

All containerized services include health check endpoints:
- Web: `GET /` 
- Backend services: `GET /health`
- PostgreSQL: `pg_isready` command

## Volumes

### Development
- Web source code mounted for hot reload
- Database files remain local

### Staging/Production
- PostgreSQL data persistence: `chinook_pg_staging_data` / `chinook_pg_prod_data`
- No source code mounts (built into images)

## Networking

### Development
- Web container communicates with local backends via `host.docker.internal`
- Backend services access local SQLite directly

### Staging/Production
- Internal Docker network for service communication
- Services reference each other by container names
- Only web service exposed externally

## Build Optimization

### .dockerignore Files
- Root level `.dockerignore` for multi-service builds
- Service-specific `.dockerignore` files to optimize build contexts
- Excludes node_modules, logs, temporary files, and development artifacts

### Multi-stage Builds
- Development stage: Includes dev dependencies and tools
- Production stage: Only runtime dependencies, optimized for size

## Security Considerations

- No hardcoded secrets in Docker images
- Environment variable injection for sensitive data
- Internal network isolation in staging/production
- Resource limits in production configuration
- Proper CORS configuration per environment

## Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure local services aren't running on same ports
2. **Database connections**: Check environment variables and network configuration
3. **CORS errors**: Verify CORS_ORIGIN settings match frontend URL
4. **Volume mounts**: Ensure proper path mapping for development hot reload

### Logs
```bash
# View service logs
docker-compose logs [service-name]

# Follow logs in real-time
docker-compose logs -f [service-name]
```

### Health Status
```bash
# Check container health
docker-compose ps

# Inspect specific service
docker-compose exec [service-name] sh
```