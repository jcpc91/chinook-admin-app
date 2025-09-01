#!/bin/bash

# Docker Production Environment Startup Script
# This script starts a production-ready containerized environment where:
# - All services run in Docker containers with production optimizations
# - PostgreSQL database with backup strategies
# - Load balancing, monitoring, and security features
# - Full production orchestration with Docker Compose

set -e  # Exit on any error

echo "🚀 Starting production containerized environment..."
echo "   - All services: Containerized (Docker) with production optimizations"
echo "   - Database: PostgreSQL with backup strategies"
echo "   - Environment: Production"
echo "   - Features: Load balancing, monitoring, security"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate environment variables
validate_env() {
    local env_file="$1"
    local required_vars="JWT_SECREAT_KEY DB_USER DB_PASSWORD CORS_ORIGIN"
    local missing_vars=""
    
    if [ ! -f "$env_file" ]; then
        echo "❌ Environment file $env_file not found"
        return 1
    fi
    
    # Source the environment file
    set -a
    source "$env_file"
    set +a
    
    # Check required variables
    for var in $required_vars; do
        if [ -z "${!var}" ]; then
            missing_vars="$missing_vars $var"
        fi
    done
    
    if [ -n "$missing_vars" ]; then
        echo "❌ Missing required environment variables:$missing_vars"
        echo "   Please update $env_file with the required values"
        return 1
    fi
    
    # Validate JWT secret length (should be at least 32 characters)
    if [ ${#JWT_SECREAT_KEY} -lt 32 ]; then
        echo "❌ JWT_SECREAT_KEY must be at least 32 characters long"
        return 1
    fi
    
    # Validate database password length (should be at least 16 characters)
    if [ ${#DB_PASSWORD} -lt 16 ]; then
        echo "❌ DB_PASSWORD must be at least 16 characters long"
        return 1
    fi
    
    return 0
}

# Function to cleanup Docker resources
cleanup() {
    echo ""
    echo "🛑 Shutting down production environment..."
    
    if [ -f docker-compose.prod.yml ]; then
        echo "   Stopping all containerized services..."
        docker-compose -f docker-compose.prod.yml --env-file .env.production down --remove-orphans
        
        # Note: In production, you typically don't want to remove volumes
        # Uncomment the following line only if you want to remove all data
        # docker-compose -f docker-compose.prod.yml --env-file .env.production down --volumes
    fi
    
    echo "✅ Production environment stopped"
    echo "💡 Database volumes are preserved for data safety"
    exit 0
}

# Set up signal handlers for graceful shutdown
trap cleanup SIGINT SIGTERM EXIT

# Verify prerequisites
echo "🔍 Verifying prerequisites..."

# Check if Docker is available
if ! command_exists docker; then
    echo "❌ Docker is not installed or not in PATH"
    echo "   Please install Docker"
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker daemon is not running"
    echo "   Please start Docker"
    exit 1
fi

# Check if docker-compose is available
if ! command_exists docker-compose; then
    echo "❌ docker-compose is not installed or not in PATH"
    echo "   Please install docker-compose"
    exit 1
fi

# Check Docker Compose version (should be 1.27+ for better features)
COMPOSE_VERSION=$(docker-compose version --short 2>/dev/null || echo "0.0.0")
echo "   Docker Compose version: $COMPOSE_VERSION"

# Check if required files exist
if [ ! -f docker-compose.prod.yml ]; then
    echo "❌ docker-compose.prod.yml not found"
    echo "   Please ensure the production Docker Compose file exists"
    exit 1
fi

# Check and validate environment file
if [ ! -f .env.production ]; then
    echo "❌ .env.production not found"
    echo ""
    echo "Please create .env.production with the following required variables:"
    echo ""
    cat << 'EOF'
# Production Environment Variables
# SECURITY WARNING: Use strong, unique values for production!

# JWT Configuration (minimum 32 characters)
JWT_SECREAT_KEY=your_production_jwt_secret_key_minimum_32_characters

# Database Configuration (minimum 16 characters for password)
DB_USER=chinook_user
DB_PASSWORD=your_secure_production_db_password_minimum_16_characters

# CORS Configuration (update with your production domain)
CORS_ORIGIN=https://your-production-domain.com,https://www.your-production-domain.com

# Optional: Backup Configuration
BACKUP_RETENTION_DAYS=30

# Optional: Logging Configuration
LOG_LEVEL=warn
ENABLE_REQUEST_LOGGING=false

# Optional: Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS_AUTH=100
RATE_LIMIT_MAX_REQUESTS_APP=1000
RATE_LIMIT_MAX_REQUESTS_CATALOGOS=500

# Optional: SSL Configuration (if using HTTPS)
# SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
# SSL_KEY_PATH=/etc/nginx/ssl/private.key
EOF
    echo ""
    exit 1
fi

# Validate environment variables
echo "   Validating environment variables..."
if ! validate_env .env.production; then
    exit 1
fi

echo "✅ All prerequisites verified"

# Check Docker system resources
echo ""
echo "🔍 Checking Docker system resources..."
DOCKER_INFO=$(docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Size}}")
echo "$DOCKER_INFO"

# Check available disk space
AVAILABLE_SPACE=$(df -h . | awk 'NR==2 {print $4}')
echo "Available disk space: $AVAILABLE_SPACE"

# Warn if low on space (production needs more space)
AVAILABLE_BYTES=$(df . | awk 'NR==2 {print $4}')
if [ "$AVAILABLE_BYTES" -lt 5242880 ]; then  # Less than 5GB
    echo "⚠️  Warning: Low disk space detected for production deployment."
    echo "   Production requires at least 5GB of free space for logs, backups, and data."
    echo "   Consider cleaning up Docker resources with 'docker system prune'"
fi

# Security check: warn about running as root
if [ "$(id -u)" -eq 0 ]; then
    echo "⚠️  Warning: Running as root user"
    echo "   For production, consider running as a non-root user with Docker group membership"
fi

# Pull latest images for production
echo ""
echo "🐳 Pulling latest production images..."
echo "   This ensures you have the latest security updates..."
docker-compose -f docker-compose.prod.yml --env-file .env.production pull postgres redis prometheus nginx-lb || {
    echo "⚠️  Failed to pull some images, continuing with local images..."
}

# Build production services
echo ""
echo "🏗️  Building production services..."
echo "   Building optimized production images..."
echo "   This may take several minutes on first run..."

# Build with no cache for production to ensure fresh builds
docker-compose -f docker-compose.prod.yml --env-file .env.production build --no-cache --parallel || {
    echo "❌ Production build failed. Check the error messages above."
    exit 1
}

echo "✅ All production services built successfully"

# Pre-flight security checks
echo ""
echo "🔒 Running pre-flight security checks..."

# Check if sensitive files have proper permissions
for file in .env.production; do
    if [ -f "$file" ]; then
        PERMS=$(stat -c "%a" "$file" 2>/dev/null || stat -f "%A" "$file" 2>/dev/null || echo "unknown")
        if [ "$PERMS" != "600" ] && [ "$PERMS" != "0600" ]; then
            echo "⚠️  Warning: $file has permissions $PERMS (should be 600)"
            echo "   Run: chmod 600 $file"
        fi
    fi
done

# Check for default passwords (basic check)
if grep -q "change_in_production\|default_password\|password123" .env.production 2>/dev/null; then
    echo "❌ Default or weak passwords detected in .env.production"
    echo "   Please use strong, unique passwords for production"
    exit 1
fi

echo "✅ Basic security checks passed"

# Start production services with proper dependency order
echo ""
echo "🚀 Starting production services..."
echo "   Starting services in dependency order with health checks..."

# Start core infrastructure first
echo "   1. Starting core infrastructure (PostgreSQL, Redis)..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d postgres redis

# Wait for PostgreSQL to be healthy
echo "   2. Waiting for PostgreSQL to be ready..."
timeout 180 bash -c 'until docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T postgres pg_isready -U $DB_USER -d chinook; do sleep 3; done' || {
    echo "❌ PostgreSQL failed to start within 3 minutes"
    echo "   Check logs: docker-compose -f docker-compose.prod.yml --env-file .env.production logs postgres"
    exit 1
}

echo "   ✅ PostgreSQL is ready"

# Wait for Redis to be healthy
echo "   3. Waiting for Redis to be ready..."
timeout 60 bash -c 'until docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T redis redis-cli ping | grep -q PONG; do sleep 2; done' || {
    echo "❌ Redis failed to start within 1 minute"
    echo "   Check logs: docker-compose -f docker-compose.prod.yml --env-file .env.production logs redis"
    exit 1
}

echo "   ✅ Redis is ready"

# Start backup service
echo "   4. Starting backup service..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d postgres-backup

# Run database migrations
echo "   5. Running database migrations..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up --no-deps db-migrate || {
    echo "❌ Database migration failed"
    echo "   Check logs: docker-compose -f docker-compose.prod.yml --env-file .env.production logs db-migrate"
    exit 1
}

echo "   ✅ Database migrations completed"

# Start monitoring
echo "   6. Starting monitoring services..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d prometheus

# Start backend services
echo "   7. Starting backend services..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d auth app catalogos

# Wait for backend services to be healthy
echo "   8. Waiting for backend services to be ready..."
for service in auth app catalogos; do
    echo "      Waiting for $service service..."
    timeout 120 bash -c "until docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T $service curl -f http://localhost:\$(docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T $service printenv PORT)/health 2>/dev/null; do sleep 3; done" || {
        echo "❌ $service service failed to start within 2 minutes"
        echo "   Check logs: docker-compose -f docker-compose.prod.yml --env-file .env.production logs $service"
        exit 1
    }
    echo "      ✅ $service service is ready"
done

# Start web service
echo "   9. Starting web frontend..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d web

# Start load balancer
echo "   10. Starting load balancer..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d nginx-lb

# Wait for web service to be ready
echo "   11. Waiting for web service to be ready..."
timeout 120 bash -c 'until curl -f http://localhost:80/ 2>/dev/null; do sleep 3; done' || {
    echo "❌ Web service failed to start within 2 minutes"
    echo "   Check logs: docker-compose -f docker-compose.prod.yml --env-file .env.production logs web nginx-lb"
    exit 1
}

echo "   ✅ Web service is ready"

# Final health check
echo ""
echo "🏥 Running final health checks..."
UNHEALTHY_SERVICES=$(docker-compose -f docker-compose.prod.yml --env-file .env.production ps --filter "health=unhealthy" --format "table {{.Service}}")
if [ -n "$UNHEALTHY_SERVICES" ] && [ "$UNHEALTHY_SERVICES" != "SERVICE" ]; then
    echo "⚠️  Some services are unhealthy:"
    echo "$UNHEALTHY_SERVICES"
    echo "   Check individual service logs for details"
fi

echo ""
echo "🎉 Production environment is running!"
echo ""
echo "🌐 Access points:"
echo "   - Web application: http://localhost:80"
echo "   - Web application (HTTPS): https://localhost:443 (if SSL configured)"
echo "   - Prometheus monitoring: http://localhost:9090 (if exposed)"
echo ""
echo "📋 Service status:"
docker-compose -f docker-compose.prod.yml --env-file .env.production ps

echo ""
echo "📊 Resource usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

echo ""
echo "📝 Production management commands:"
echo "   - View all logs: docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f"
echo "   - View service logs: docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f <service>"
echo "   - Check service health: docker-compose -f docker-compose.prod.yml --env-file .env.production ps"
echo "   - Scale services: docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --scale <service>=<count>"
echo "   - Update service: docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --no-deps --build <service>"
echo ""
echo "🔧 Database management:"
echo "   - Connect to PostgreSQL: docker-compose -f docker-compose.prod.yml --env-file .env.production exec postgres psql -U \$DB_USER -d chinook"
echo "   - Manual backup: docker-compose -f docker-compose.prod.yml --env-file .env.production exec postgres-backup /scripts/backup.sh"
echo "   - Restore backup: docker-compose -f docker-compose.prod.yml --env-file .env.production exec postgres-backup /scripts/restore.sh <backup_file>"
echo ""
echo "📊 Monitoring:"
echo "   - Prometheus metrics: http://localhost:9090 (if exposed)"
echo "   - Container stats: docker stats"
echo "   - System resources: docker system df"
echo ""
echo "🔒 Security notes:"
echo "   - All containers run with security restrictions"
echo "   - Database data is encrypted at rest"
echo "   - Regular automated backups are configured"
echo "   - Rate limiting is enabled on all API endpoints"
echo "   - CORS protection is configured"
echo ""
echo "💡 Production tips:"
echo "   - Monitor logs regularly for security events"
echo "   - Keep Docker images updated for security patches"
echo "   - Backup database regularly (automated backups are configured)"
echo "   - Monitor resource usage and scale as needed"
echo "   - Use HTTPS in production (configure SSL certificates)"
echo ""
echo "⏳ Production environment is running. Press Ctrl+C to stop..."

# In production, we don't follow logs by default to avoid cluttering
# Instead, provide instructions for monitoring
echo ""
echo "📊 To monitor the production environment:"
echo "   - Follow all logs: docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f"
echo "   - Monitor specific service: docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f <service>"
echo "   - Check resource usage: watch docker stats"
echo ""

# Wait indefinitely (until Ctrl+C)
while true; do
    sleep 60
    # Optional: Add periodic health checks here
    # docker-compose -f docker-compose.prod.yml --env-file .env.production ps --filter "health=unhealthy" --quiet | wc -l
done