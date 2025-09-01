# Production Deployment Guide

This guide covers deploying the Chinook music database administration application in production using Docker containers.

## Overview

The production deployment includes:
- Full containerization of all services (web, auth, app, catalogos)
- PostgreSQL database with automated backups
- Nginx load balancer with SSL termination
- Redis caching layer
- Prometheus monitoring
- Security hardening and resource limits
- High availability configuration

## Prerequisites

### System Requirements
- Docker Engine 20.10+ 
- Docker Compose 2.0+
- Minimum 4GB RAM, 8GB recommended
- Minimum 20GB disk space for containers and data
- SSL certificates (for production HTTPS)

### Network Requirements
- Ports 80 and 443 available for web traffic
- Internal Docker network for service communication
- Optional: Port 9090 for Prometheus monitoring

## Quick Start

### 1. Environment Configuration

Copy the production environment template:
```bash
cp .env.production.template .env.production
```

Edit `.env.production` and configure the following **critical** variables:

```bash
# CHANGE THESE VALUES FOR PRODUCTION!
JWT_SECREAT_KEY=your_secure_jwt_secret_minimum_32_characters
DB_PASSWORD=your_secure_database_password_minimum_16_characters
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
```

### 2. SSL Certificates

For production HTTPS, place your SSL certificates in:
- `nginx/ssl/cert.pem` - SSL certificate
- `nginx/ssl/private.key` - Private key

For testing, self-signed certificates will be generated automatically.

### 3. Deploy Application

**Linux/macOS:**
```bash
./docker-run.prod.sh deploy
```

**Windows:**
```powershell
.\docker-run.prod.ps1 deploy
```

The deployment script will:
1. Validate configuration
2. Create necessary directories
3. Generate SSL certificates (if missing)
4. Build and start all services
5. Wait for services to be healthy
6. Run database migrations
7. Display deployment information

## Service Architecture

### Container Services

| Service | Purpose | Replicas | Resources |
|---------|---------|----------|-----------|
| `postgres` | PostgreSQL database | 1 | 2 CPU, 2GB RAM |
| `postgres-backup` | Automated backups | 1 | 0.5 CPU, 512MB RAM |
| `auth` | Authentication API | 2 | 1 CPU, 1GB RAM |
| `app` | Main application API | 3 | 2 CPU, 2GB RAM |
| `catalogos` | Catalog management API | 2 | 1 CPU, 1GB RAM |
| `web` | Vue.js frontend | 2 | 1 CPU, 512MB RAM |
| `nginx-lb` | Load balancer | 1 | 0.5 CPU, 256MB RAM |
| `redis` | Caching layer | 1 | 0.5 CPU, 512MB RAM |
| `prometheus` | Monitoring | 1 | 1 CPU, 1GB RAM |

### Network Configuration

- **External Network**: Nginx load balancer exposes ports 80/443
- **Internal Network**: All services communicate via Docker network `chinook-prod-network`
- **Database Network**: PostgreSQL isolated with backup service access

### Volume Management

- **postgres_prod_data**: PostgreSQL data persistence
- **postgres_prod_backups**: Database backup storage
- **redis_prod_data**: Redis cache persistence
- **nginx_cache**: Nginx caching layer
- **prometheus_data**: Monitoring data storage

## Management Commands

### Service Management

```bash
# View service status
./docker-run.prod.sh status

# View logs (all services)
./docker-run.prod.sh logs

# View logs (specific service)
./docker-run.prod.sh logs auth

# Restart all services
./docker-run.prod.sh restart

# Stop all services
./docker-run.prod.sh stop
```

### Scaling Services

```bash
# Scale backend services for high load
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --scale auth=3 --scale app=5 --scale catalogos=3

# Scale web frontend
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --scale web=3
```

### Database Management

```bash
# Create manual backup
./docker-run.prod.sh backup

# List available backups
docker-compose -f docker-compose.prod.yml --env-file .env.production exec postgres-backup ls -la /backups/

# Restore from backup
docker-compose -f docker-compose.prod.yml --env-file .env.production exec postgres-backup /scripts/restore.sh chinook_backup_20240815_120000.sql.gz
```

### Zero-Downtime Updates

```bash
# Update specific service without downtime
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --no-deps --build auth

# Rolling update all services
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

## Monitoring and Health Checks

### Health Check Endpoints

- **Load Balancer**: `http://localhost:8080/health`
- **Web Frontend**: `http://localhost/health`
- **Auth Service**: `http://localhost:3000/health` (internal)
- **App Service**: `http://localhost:3001/health` (internal)
- **Catalogos Service**: `http://localhost:3002/health` (internal)

### Prometheus Monitoring

Access Prometheus at `http://localhost:9090` (if exposed) to monitor:
- Service health and uptime
- Database performance metrics
- Container resource usage
- API response times
- Error rates

### Log Management

```bash
# View real-time logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f

# View logs with timestamps
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -t

# Export logs for analysis
docker-compose -f docker-compose.prod.yml --env-file .env.production logs > application.log
```

## Security Features

### Container Security
- All containers run as non-root users
- Read-only filesystems where possible
- No new privileges security option
- Resource limits prevent resource exhaustion
- Network isolation between services

### Application Security
- JWT authentication with secure secret keys
- CORS protection with domain whitelist
- Rate limiting on all API endpoints
- Security headers (CSP, HSTS, X-Frame-Options)
- SSL/TLS termination at load balancer
- Secure cookie configuration

### Database Security
- PostgreSQL with dedicated user accounts
- Connection pooling with limits
- Automated encrypted backups
- Network isolation from external access

## Backup and Recovery

### Automated Backups

- **Schedule**: Daily at 2:00 AM (configurable)
- **Retention**: 30 days (configurable via `BACKUP_RETENTION_DAYS`)
- **Format**: Compressed SQL dumps with timestamps
- **Location**: `/var/lib/docker/volumes/chinook_postgres_prod_backups/_data`

### Manual Backup

```bash
# Create immediate backup
docker-compose -f docker-compose.prod.yml --env-file .env.production exec postgres-backup /scripts/backup.sh

# Verify backup
docker-compose -f docker-compose.prod.yml --env-file .env.production exec postgres-backup ls -la /backups/
```

### Disaster Recovery

```bash
# Stop application services (keep database running)
docker-compose -f docker-compose.prod.yml --env-file .env.production stop web auth app catalogos

# Restore database
docker-compose -f docker-compose.prod.yml --env-file .env.production exec postgres-backup /scripts/restore.sh <backup_file>

# Restart application services
docker-compose -f docker-compose.prod.yml --env-file .env.production start web auth app catalogos
```

## Performance Optimization

### Database Optimization
- Connection pooling (5-50 connections per service)
- PostgreSQL performance tuning
- Automated vacuum and analyze
- Query performance monitoring

### Caching Strategy
- Redis caching for frequently accessed data
- Nginx static asset caching
- Browser caching with proper headers
- CDN-ready configuration

### Load Balancing
- Nginx upstream load balancing
- Health check-based routing
- Session affinity support
- Automatic failover

## Troubleshooting

### Common Issues

**Services not starting:**
```bash
# Check service logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs <service_name>

# Check resource usage
docker stats

# Verify environment variables
docker-compose -f docker-compose.prod.yml --env-file .env.production config
```

**Database connection issues:**
```bash
# Check PostgreSQL logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs postgres

# Test database connectivity
docker-compose -f docker-compose.prod.yml --env-file .env.production exec postgres pg_isready -U chinook_user
```

**SSL/HTTPS issues:**
```bash
# Check Nginx configuration
docker-compose -f docker-compose.prod.yml --env-file .env.production exec nginx-lb nginx -t

# Verify SSL certificates
openssl x509 -in nginx/ssl/cert.pem -text -noout
```

### Performance Issues

**High CPU usage:**
```bash
# Check container resource usage
docker stats

# Scale services if needed
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --scale app=5
```

**Memory issues:**
```bash
# Check memory usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Restart services to clear memory leaks
docker-compose -f docker-compose.prod.yml --env-file .env.production restart
```

## Maintenance

### Regular Maintenance Tasks

1. **Weekly**: Review logs for errors and performance issues
2. **Monthly**: Update container images and security patches
3. **Quarterly**: Review and rotate secrets (JWT keys, passwords)
4. **Annually**: Review SSL certificate expiration

### Update Procedure

```bash
# 1. Backup current state
./docker-run.prod.sh backup

# 2. Pull latest images
docker-compose -f docker-compose.prod.yml --env-file .env.production pull

# 3. Rebuild and deploy
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# 4. Verify deployment
./docker-run.prod.sh status
```

## Support and Documentation

- **Application Logs**: Available via Docker Compose logs
- **Database Logs**: PostgreSQL container logs
- **Monitoring**: Prometheus metrics at `:9090`
- **Health Checks**: Built-in endpoints for all services

For additional support, check the application documentation and container logs for specific error messages.