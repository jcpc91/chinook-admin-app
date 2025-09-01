# Container Troubleshooting Guide

## Quick Diagnostics

### Check Overall System Health
```bash
# Use the container management script
./container-management.sh status <env>
./container-management.sh health <env>
./container-management.sh troubleshoot <env>
```

### Common Issues and Solutions

## 1. Services Won't Start

### Symptoms
- Containers exit immediately after starting
- Services show "Exited" status
- Health checks fail

### Diagnosis
```bash
# Check service logs
./container-management.sh logs <env> <service>

# Check container status
docker-compose -f docker-compose.<env>.yml ps

# Check resource usage
docker stats --no-stream
```

### Solutions

#### Port Conflicts
```bash
# Check what's using the port
lsof -i :3000  # Replace with your port
netstat -tulpn | grep :3000

# Kill conflicting process
sudo kill -9 <PID>

# Or change port in environment file
```

#### Insufficient Resources
```bash
# Check available resources
free -h  # Memory
df -h    # Disk space

# Clean up Docker resources
./container-management.sh cleanup <env>
docker system prune -f
```

#### Environment Variable Issues
```bash
# Validate environment file
cat .env.<env>

# Check for missing variables
docker-compose -f docker-compose.<env>.yml config

# Regenerate environment file from template
cp .env.<env>.template .env.<env>
# Edit with your values
```

## 2. Database Connection Issues

### Symptoms
- "Connection refused" errors
- "Database does not exist" errors
- Migration failures

### Diagnosis
```bash
# Check PostgreSQL status
docker-compose -f docker-compose.<env>.yml exec postgres pg_isready -U $DB_USER

# Check database logs
./container-management.sh logs <env> postgres

# Test connection
docker-compose -f docker-compose.<env>.yml exec postgres psql -U $DB_USER -d chinook -c "SELECT 1;"
```

### Solutions

#### PostgreSQL Not Ready
```bash
# Wait for PostgreSQL to start
timeout 60 bash -c 'until docker-compose -f docker-compose.<env>.yml exec postgres pg_isready -U $DB_USER; do sleep 2; done'

# Restart PostgreSQL
./container-management.sh restart <env> postgres
```

#### Database Doesn't Exist
```bash
# Create database manually
docker-compose -f docker-compose.<env>.yml exec postgres createdb -U $DB_USER chinook

# Run migrations
docker-compose -f docker-compose.<env>.yml up --no-deps db-migrate
```

#### Connection Pool Issues
```bash
# Check active connections
docker-compose -f docker-compose.<env>.yml exec postgres psql -U $DB_USER -d chinook -c "SELECT * FROM pg_stat_activity;"

# Restart services to reset connections
./container-management.sh restart <env>
```

## 3. Network Connectivity Issues

### Symptoms
- Services can't communicate with each other
- "Connection refused" between services
- Web frontend can't reach backend

### Diagnosis
```bash
# Check Docker networks
docker network ls
docker network inspect <network_name>

# Test connectivity between containers
docker-compose -f docker-compose.<env>.yml exec web ping auth
docker-compose -f docker-compose.<env>.yml exec auth curl -f http://app:3001/health
```

### Solutions

#### Network Configuration
```bash
# Recreate network
docker-compose -f docker-compose.<env>.yml down
docker network prune -f
docker-compose -f docker-compose.<env>.yml up -d
```

#### Service Discovery Issues
```bash
# Check service names in compose file
docker-compose -f docker-compose.<env>.yml config --services

# Verify internal URLs in environment variables
grep -E "(URL|HOST)" .env.<env>
```

## 4. Performance Issues

### Symptoms
- Slow response times
- High CPU/memory usage
- Timeouts

### Diagnosis
```bash
# Monitor resource usage
./container-management.sh monitor <env>

# Check container limits
docker inspect <container_name> | grep -A 10 "Resources"

# Analyze logs for performance issues
./container-management.sh logs <env> | grep -E "(slow|timeout|error)"
```

### Solutions

#### Resource Limits
```bash
# Scale services (production only)
./container-management.sh scale prod app 3

# Adjust resource limits in compose file
# Edit docker-compose.<env>.yml deploy.resources section
```

#### Database Performance
```bash
# Check database performance
docker-compose -f docker-compose.<env>.yml exec postgres psql -U $DB_USER -d chinook -c "
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;"

# Analyze slow queries
docker-compose -f docker-compose.<env>.yml exec postgres psql -U $DB_USER -d chinook -c "
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
WHERE mean_time > 1000 
ORDER BY mean_time DESC;"
```

## 5. SSL/HTTPS Issues

### Symptoms
- SSL certificate errors
- Mixed content warnings
- HTTPS redirects not working

### Diagnosis
```bash
# Check SSL certificate
openssl x509 -in nginx/ssl/cert.pem -text -noout

# Test SSL configuration
curl -I https://localhost/

# Check nginx logs
./container-management.sh logs <env> nginx-lb
```

### Solutions

#### Certificate Issues
```bash
# Generate self-signed certificate for testing
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/private.key \
  -out nginx/ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Set proper permissions
chmod 600 nginx/ssl/private.key
chmod 644 nginx/ssl/cert.pem
```

## 6. Build Issues

### Symptoms
- Docker build failures
- "No space left on device" errors
- Image pull failures

### Diagnosis
```bash
# Check Docker system usage
docker system df

# Check build logs
docker-compose -f docker-compose.<env>.yml build --no-cache <service>

# Check available space
df -h
```

### Solutions

#### Disk Space Issues
```bash
# Clean up Docker resources
docker system prune -a -f
docker volume prune -f

# Remove unused images
docker image prune -a -f

# Clean up old containers
docker container prune -f
```

#### Build Cache Issues
```bash
# Build without cache
docker-compose -f docker-compose.<env>.yml build --no-cache

# Pull latest base images
docker-compose -f docker-compose.<env>.yml pull
```

## 7. Environment-Specific Issues

### Development Environment

#### Web Service Can't Reach Local Backend
```bash
# Check host.docker.internal resolution
docker-compose -f docker-compose.dev.yml exec web ping host.docker.internal

# Verify backend services are running locally
ps aux | grep -E "(node|npm)"
netstat -tulpn | grep -E ":300[0-2]"

# Check CORS configuration
curl -H "Origin: http://localhost:5173" -I http://localhost:3000/health
```

### Staging Environment

#### Full Container Communication Issues
```bash
# Check all services are in same network
docker network inspect chinook-staging-network

# Test inter-service communication
docker-compose -f docker-compose.staging.yml exec web curl -f http://auth:3000/health
docker-compose -f docker-compose.staging.yml exec auth curl -f http://app:3001/health
```

### Production Environment

#### Load Balancer Issues
```bash
# Check nginx configuration
docker-compose -f docker-compose.prod.yml exec nginx-lb nginx -t

# Check upstream servers
docker-compose -f docker-compose.prod.yml exec nginx-lb curl -f http://web:80/

# Check SSL termination
curl -I https://localhost/
```

## Recovery Procedures

### Service Recovery
```bash
# Restart single service
./container-management.sh restart <env> <service>

# Rebuild and restart service
./container-management.sh update <env> <service>

# Scale down and up (production)
./container-management.sh scale prod <service> 0
./container-management.sh scale prod <service> 2
```

### Database Recovery
```bash
# Restore from backup
./container-management.sh restore <env> <backup_file>

# Reset database (CAUTION: destroys data)
docker-compose -f docker-compose.<env>.yml down
docker volume rm <postgres_volume>
docker-compose -f docker-compose.<env>.yml up -d
```

### Complete Environment Reset
```bash
# Stop all services
docker-compose -f docker-compose.<env>.yml down --remove-orphans

# Remove all data (CAUTION)
./container-management.sh cleanup <env> true

# Rebuild and restart
docker-compose -f docker-compose.<env>.yml up -d --build
```

## Monitoring and Alerting

### Log Analysis
```bash
# Search for errors
./container-management.sh logs <env> | grep -i error

# Monitor specific patterns
./container-management.sh logs <env> | grep -E "(timeout|connection|failed)"

# Export logs for analysis
./container-management.sh logs <env> --no-color > application.log
```

### Performance Monitoring
```bash
# Real-time monitoring
./container-management.sh monitor <env>

# Resource usage alerts
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemPerc}}" | awk 'NR>1 && ($2+0 > 80 || $3+0 > 80) {print "HIGH USAGE: " $0}'
```

### Health Check Automation
```bash
# Automated health checks
while true; do
  if ! ./container-management.sh health <env>; then
    echo "Health check failed at $(date)"
    # Add alerting logic here
  fi
  sleep 300  # Check every 5 minutes
done
```

## Getting Help

### Collect Diagnostic Information
```bash
# Generate comprehensive diagnostic report
{
  echo "=== System Information ==="
  uname -a
  docker version
  docker-compose version
  
  echo -e "\n=== Docker System Info ==="
  docker system df
  docker system info
  
  echo -e "\n=== Service Status ==="
  ./container-management.sh status <env>
  
  echo -e "\n=== Recent Logs ==="
  ./container-management.sh logs <env> --tail=50
  
  echo -e "\n=== Resource Usage ==="
  docker stats --no-stream
  
  echo -e "\n=== Network Configuration ==="
  docker network ls
  
} > diagnostic-report-$(date +%Y%m%d-%H%M%S).txt
```

### Contact Information
- System Administrator: [Contact Information]
- Development Team: [Contact Information]
- Infrastructure Team: [Contact Information]

### Useful Resources
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Troubleshooting](https://docs.docker.com/compose/troubleshooting/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Application-specific Documentation](./DEPLOYMENT_GUIDE.md)