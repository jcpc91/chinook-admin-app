# Chinook Application Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Chinook music database administration application across different environments using Docker containerization.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Environment Types](#environment-types)
3. [Prerequisites](#prerequisites)
4. [Development Deployment](#development-deployment)
5. [Staging Deployment](#staging-deployment)
6. [Production Deployment](#production-deployment)
7. [Container Management](#container-management)
8. [Troubleshooting](#troubleshooting)
9. [Security Considerations](#security-considerations)
10. [Monitoring and Logging](#monitoring-and-logging)

## Architecture Overview

The Chinook application consists of:
- **Web Frontend**: Vue.js 3 application with Vite
- **Backend Services**: Three Express.js microservices
  - Auth Service (port 3000): Authentication and authorization
  - App Service (port 3001): Main application logic
  - Catalogos Service (port 3002): Catalog management
- **Database**: SQLite (development) / PostgreSQL (staging/production)
- **Additional Services**: Redis cache, monitoring, load balancing (production)

## Environment Types

### Development Environment
- **Purpose**: Local development with hot reload
- **Architecture**: Hybrid (containerized web + local backend services)
- **Database**: Local SQLite files
- **Use Case**: Active development and testing

### Staging Environment
- **Purpose**: Pre-production testing and validation
- **Architecture**: Fully containerized
- **Database**: PostgreSQL container
- **Use Case**: Integration testing, UAT, performance testing

### Production Environment
- **Purpose**: Live production deployment
- **Architecture**: Fully containerized with optimizations
- **Database**: PostgreSQL with backup strategies
- **Use Case**: Production workloads with high availability

## Prerequisites

### System Requirements
- **Operating System**: Linux, macOS, or Windows with WSL2
- **Docker**: Version 20.10+ 
- **Docker Compose**: Version 1.27+
- **Memory**: Minimum 4GB RAM (8GB+ recommended for production)
- **Storage**: Minimum 10GB free space (20GB+ for production)
- **Network**: Internet access for image pulls and updates

### Software Dependencies
```bash
# Verify Docker installation
docker --version
docker-compose --version

# Verify Docker daemon is running
docker info
```

### Port Requirements
- **Development**: 3000, 3001, 3002, 5173
- **Staging**: 80, 3000, 3001, 3002, 5432, 9324
- **Production**: 80, 443, 5432, 6379, 9090 (internal: 3000-3002)## Developme
nt Deployment

### Quick Start
```bash
# 1. Initialize development environment
./docker-init.dev.sh

# 2. Start hybrid development environment
./docker-run.dev.sh
```

### Manual Setup
```bash
# 1. Initialize database and dependencies
cd database && npm install && npm run migrate-app && npm run migrate-auth && npm run migrate-cat

# 2. Install service dependencies
cd auth && npm install
cd app && npm install  
cd catalogos && npm install
cd web && npm install

# 3. Build web container
docker-compose -f docker-compose.dev.yml build web

# 4. Start services
docker-compose -f docker-compose.dev.yml up web &
cd auth && npm run dev &
cd app && npm run dev &
cd catalogos && npm run dev &
```

### Development Configuration
- **Web Service**: Containerized with hot reload via volume mounts
- **Backend Services**: Run locally with nodemon for hot reload
- **Database**: Local SQLite files in `.db/` directory
- **Environment Files**: Auto-generated during initialization

### Access Points
- Web Application: http://localhost:5173
- Auth Service: http://localhost:3000
- App Service: http://localhost:3001
- Catalogos Service: http://localhost:3002

## Staging Deployment

### Quick Start
```bash
# 1. Create staging environment file
cp .env.staging.template .env.staging
# Edit .env.staging with your staging values

# 2. Start staging environment
./docker-run.staging.sh
```

### Manual Setup
```bash
# 1. Create environment file
cat > .env.staging << EOF
JWT_SECREAT_KEY=your_staging_jwt_secret_32_chars_min
DB_USER=chinook_user
DB_PASSWORD=your_staging_db_password_16_chars_min
CORS_ORIGIN=http://localhost:80,http://your-staging-domain.com
EOF

# 2. Build and start services
docker-compose -f docker-compose.staging.yml --env-file .env.staging build
docker-compose -f docker-compose.staging.yml --env-file .env.staging up -d

# 3. Verify deployment
docker-compose -f docker-compose.staging.yml --env-file .env.staging ps
```

### Staging Features
- **Full Containerization**: All services run in containers
- **PostgreSQL Database**: Persistent data with Docker volumes
- **Service Dependencies**: Proper startup order with health checks
- **Logging**: Centralized logging with Fluentd
- **Monitoring**: Basic health checks and metrics

### Access Points
- Web Application: http://localhost:80
- Auth Service: http://localhost:3000
- App Service: http://localhost:3001
- Catalogos Service: http://localhost:3002
- PostgreSQL: localhost:5432
- ElasticMQ: http://localhost:9324## Pr
oduction Deployment

### Prerequisites
```bash
# 1. Verify system resources
df -h  # Check disk space (minimum 20GB recommended)
free -h  # Check memory (minimum 8GB recommended)

# 2. Create production environment file
cat > .env.production << EOF
# SECURITY WARNING: Use strong, unique values for production!
JWT_SECREAT_KEY=your_production_jwt_secret_minimum_32_characters
DB_USER=chinook_user
DB_PASSWORD=your_secure_production_db_password_minimum_16_characters
CORS_ORIGIN=https://your-production-domain.com,https://www.your-production-domain.com
BACKUP_RETENTION_DAYS=30
LOG_LEVEL=warn
ENABLE_REQUEST_LOGGING=false
EOF

# 3. Set proper file permissions
chmod 600 .env.production
```

### Deployment Process
```bash
# 1. Start production environment
./docker-run.prod.sh

# Or manually:
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

### Production Features
- **High Availability**: Multiple replicas for critical services
- **Load Balancing**: Nginx load balancer with SSL termination
- **Database Backup**: Automated PostgreSQL backups with retention
- **Monitoring**: Prometheus metrics collection
- **Security**: Enhanced security configurations and restrictions
- **Performance**: Optimized resource limits and caching
- **Logging**: Structured JSON logging with rotation

### Production Services
- **Web Frontend**: 2 replicas with Nginx load balancer
- **Auth Service**: 2 replicas with rate limiting
- **App Service**: 3 replicas with connection pooling
- **Catalogos Service**: 2 replicas with caching
- **PostgreSQL**: Single instance with backup service
- **Redis**: Caching and session storage
- **Prometheus**: Metrics and monitoring
- **Nginx**: Load balancer and SSL termination

### Access Points
- Web Application: http://localhost:80, https://localhost:443
- Prometheus: http://localhost:9090 (if exposed)
- Internal services accessible via Docker network only

### SSL Configuration (Optional)
```bash
# 1. Place SSL certificates
mkdir -p nginx/ssl
cp your-cert.pem nginx/ssl/cert.pem
cp your-private-key.pem nginx/ssl/private.key

# 2. Update nginx configuration
# Edit nginx/nginx.conf to enable SSL

# 3. Update environment variables
echo "SSL_CERT_PATH=/etc/nginx/ssl/cert.pem" >> .env.production
echo "SSL_KEY_PATH=/etc/nginx/ssl/private.key" >> .env.production
```

## Container Management

### Common Commands

#### Service Management
```bash
# Start all services
docker-compose -f docker-compose.{env}.yml up -d

# Stop all services
docker-compose -f docker-compose.{env}.yml down

# Restart specific service
docker-compose -f docker-compose.{env}.yml restart <service>

# Scale services (production)
docker-compose -f docker-compose.prod.yml up -d --scale app=5 --scale auth=3

# Update service without downtime
docker-compose -f docker-compose.{env}.yml up -d --no-deps --build <service>
```

#### Monitoring and Logs
```bash
# View service status
docker-compose -f docker-compose.{env}.yml ps

# Follow logs for all services
docker-compose -f docker-compose.{env}.yml logs -f

# Follow logs for specific service
docker-compose -f docker-compose.{env}.yml logs -f <service>

# View resource usage
docker stats

# Check container health
docker-compose -f docker-compose.{env}.yml exec <service> curl -f http://localhost:<port>/health
```#### Dat
abase Management
```bash
# Connect to PostgreSQL (staging/production)
docker-compose -f docker-compose.{env}.yml exec postgres psql -U $DB_USER -d chinook

# Run database migrations
docker-compose -f docker-compose.{env}.yml up --no-deps db-migrate

# Manual backup
docker-compose -f docker-compose.prod.yml exec postgres-backup /scripts/backup.sh

# Restore from backup
docker-compose -f docker-compose.prod.yml exec postgres-backup /scripts/restore.sh <backup_file>

# View database size
docker-compose -f docker-compose.{env}.yml exec postgres psql -U $DB_USER -d chinook -c "\l+"
```

#### Container Maintenance
```bash
# Clean up unused resources
docker system prune -f

# Remove unused images
docker image prune -f

# Remove unused volumes (CAUTION: This removes data)
docker volume prune -f

# Update base images
docker-compose -f docker-compose.{env}.yml pull
docker-compose -f docker-compose.{env}.yml up -d --build
```

## Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check service logs
docker-compose -f docker-compose.{env}.yml logs <service>

# Check container status
docker-compose -f docker-compose.{env}.yml ps

# Check resource usage
docker stats --no-stream

# Verify environment variables
docker-compose -f docker-compose.{env}.yml exec <service> env
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose -f docker-compose.{env}.yml exec postgres pg_isready -U $DB_USER

# Check database logs
docker-compose -f docker-compose.{env}.yml logs postgres

# Verify database configuration
docker-compose -f docker-compose.{env}.yml exec postgres psql -U $DB_USER -d chinook -c "SELECT version();"

# Check network connectivity
docker-compose -f docker-compose.{env}.yml exec <service> ping postgres
```

#### Performance Issues
```bash
# Monitor resource usage
docker stats

# Check container limits
docker inspect <container_name> | grep -A 10 "Resources"

# View system resources
df -h  # Disk usage
free -h  # Memory usage
top  # CPU usage

# Check Docker daemon logs
journalctl -u docker.service -f
```

#### Network Issues
```bash
# List Docker networks
docker network ls

# Inspect network configuration
docker network inspect <network_name>

# Check port bindings
docker port <container_name>

# Test service connectivity
docker-compose -f docker-compose.{env}.yml exec <service> curl -f http://<target_service>:<port>/health
```

### Recovery Procedures

#### Service Recovery
```bash
# Restart unhealthy service
docker-compose -f docker-compose.{env}.yml restart <service>

# Rebuild and restart service
docker-compose -f docker-compose.{env}.yml up -d --no-deps --build <service>

# Scale down and up (production)
docker-compose -f docker-compose.prod.yml up -d --scale <service>=0
docker-compose -f docker-compose.prod.yml up -d --scale <service>=2
```

#### Database Recovery
```bash
# Restore from latest backup
docker-compose -f docker-compose.prod.yml exec postgres-backup /scripts/restore.sh latest

# Reset database (CAUTION: This removes all data)
docker-compose -f docker-compose.{env}.yml down
docker volume rm <postgres_volume>
docker-compose -f docker-compose.{env}.yml up -d
```

#### Complete Environment Reset
```bash
# Stop all services
docker-compose -f docker-compose.{env}.yml down

# Remove all containers and networks
docker-compose -f docker-compose.{env}.yml down --remove-orphans

# Remove volumes (CAUTION: This removes all data)
docker-compose -f docker-compose.{env}.yml down --volumes

# Rebuild and restart
docker-compose -f docker-compose.{env}.yml up -d --build
```## Security
 Considerations

### Environment Security
```bash
# Set proper file permissions
chmod 600 .env.*
chmod 700 scripts/

# Use strong passwords (minimum requirements)
# JWT_SECREAT_KEY: 32+ characters
# DB_PASSWORD: 16+ characters with mixed case, numbers, symbols

# Regularly rotate secrets
# Update JWT_SECREAT_KEY and DB_PASSWORD periodically
```

### Container Security
- All containers run as non-root users where possible
- Read-only filesystems enabled for production containers
- Security options: `no-new-privileges:true`
- Resource limits prevent resource exhaustion attacks
- Network isolation between environments

### Database Security
```bash
# Enable SSL for PostgreSQL connections (production)
# Configure in postgresql.conf:
ssl = on
ssl_cert_file = '/etc/ssl/certs/server.crt'
ssl_key_file = '/etc/ssl/private/server.key'

# Regular security updates
docker-compose pull  # Update base images
docker-compose up -d --build  # Rebuild with updates
```

### Network Security
- CORS protection configured per environment
- Rate limiting on all API endpoints
- Internal Docker network isolation
- Only necessary ports exposed externally

### Monitoring Security Events
```bash
# Monitor failed authentication attempts
docker-compose -f docker-compose.{env}.yml logs auth | grep "authentication failed"

# Monitor unusual resource usage
docker stats --no-stream | awk 'NR>1 && $3+0 > 80 {print $1, $3}'

# Check for security updates
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}"
```

## Monitoring and Logging

### Health Monitoring
```bash
# Check all service health
docker-compose -f docker-compose.{env}.yml ps

# Individual service health checks
curl -f http://localhost:3000/health  # Auth service
curl -f http://localhost:3001/health  # App service
curl -f http://localhost:3002/health  # Catalogos service
curl -f http://localhost:5173/        # Web service

# Database health
docker-compose -f docker-compose.{env}.yml exec postgres pg_isready -U $DB_USER
```

### Log Management
```bash
# View aggregated logs
docker-compose -f docker-compose.{env}.yml logs -f

# Filter logs by service
docker-compose -f docker-compose.{env}.yml logs -f auth app

# Search logs for errors
docker-compose -f docker-compose.{env}.yml logs | grep -i error

# Export logs for analysis
docker-compose -f docker-compose.{env}.yml logs --no-color > application.log
```

### Performance Monitoring
```bash
# Real-time resource monitoring
docker stats

# Historical resource usage
docker-compose -f docker-compose.prod.yml exec prometheus curl -s 'http://localhost:9090/api/v1/query?query=container_memory_usage_bytes'

# Database performance
docker-compose -f docker-compose.{env}.yml exec postgres psql -U $DB_USER -d chinook -c "SELECT * FROM pg_stat_activity;"
```

### Backup Monitoring
```bash
# Check backup status (production)
docker-compose -f docker-compose.prod.yml exec postgres-backup ls -la /backups/

# Verify backup integrity
docker-compose -f docker-compose.prod.yml exec postgres-backup /scripts/verify-backup.sh latest

# Test backup restoration (in test environment)
docker-compose -f docker-compose.test.yml exec postgres-backup /scripts/restore.sh test-backup.sql
```

## Best Practices

### Development
- Use the hybrid development setup for active development
- Regularly pull latest base images for security updates
- Test changes in staging before production deployment
- Use volume mounts for hot reload during development

### Staging
- Mirror production configuration as closely as possible
- Run full integration tests in staging environment
- Validate database migrations in staging first
- Test backup and recovery procedures

### Production
- Use strong, unique secrets for all environments
- Enable automated backups with proper retention
- Monitor resource usage and scale as needed
- Implement proper SSL/TLS certificates
- Regular security updates and patches
- Monitor logs for security events and errors

### Maintenance
- Regular backup testing and verification
- Periodic security updates for base images
- Monitor and rotate logs to prevent disk space issues
- Document any custom configurations or procedures
- Maintain environment-specific documentation

## Support and Resources

### Documentation
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Vue.js Documentation](https://vuejs.org/guide/)
- [Express.js Documentation](https://expressjs.com/)

### Troubleshooting Resources
- Check service logs first: `docker-compose logs <service>`
- Verify environment configuration
- Test network connectivity between services
- Monitor resource usage and limits
- Review Docker daemon logs for system issues

### Emergency Contacts
- System Administrator: [Contact Information]
- Database Administrator: [Contact Information]
- Development Team: [Contact Information]
- Infrastructure Team: [Contact Information]