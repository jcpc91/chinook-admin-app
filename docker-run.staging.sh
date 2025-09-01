#!/bin/bash

# Docker Staging Environment Startup Script
# This script starts a full containerized staging environment where:
# - All services run in Docker containers
# - PostgreSQL database container
# - Full service orchestration with Docker Compose

set -e  # Exit on any error

echo "🚀 Starting full containerized staging environment..."
echo "   - All services: Containerized (Docker)"
echo "   - Database: PostgreSQL container"
echo "   - Environment: Staging"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to cleanup Docker resources
cleanup() {
    echo ""
    echo "🛑 Shutting down staging environment..."
    
    if [ -f docker-compose.staging.yml ]; then
        echo "   Stopping all containerized services..."
        docker-compose -f docker-compose.staging.yml down --remove-orphans
        
        # Optionally remove volumes (uncomment if needed)
        # echo "   Removing volumes..."
        # docker-compose -f docker-compose.staging.yml down --volumes
    fi
    
    echo "✅ Staging environment stopped"
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

# Check if required files exist
if [ ! -f docker-compose.staging.yml ]; then
    echo "❌ docker-compose.staging.yml not found"
    echo "   Please ensure the staging Docker Compose file exists"
    exit 1
fi

# Check if environment file exists
if [ ! -f .env.staging ]; then
    echo "⚠️  .env.staging not found, creating default environment file..."
    
    # Generate a secure JWT secret
    if command_exists openssl; then
        JWT_SECRET=$(openssl rand -hex 32)
    elif command_exists node; then
        JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    else
        JWT_SECRET="staging_jwt_secret_$(date +%s)_change_in_production"
    fi
    
    # Generate a secure database password
    if command_exists openssl; then
        DB_PASSWORD=$(openssl rand -base64 24)
    else
        DB_PASSWORD="staging_db_password_$(date +%s)"
    fi
    
    cat > .env.staging << EOF
# Staging Environment Variables
# Generated automatically - please review and update as needed

# JWT Configuration
JWT_SECREAT_KEY=$JWT_SECRET

# Database Configuration
DB_USER=chinook_user
DB_PASSWORD=$DB_PASSWORD

# CORS Configuration (update with your staging domain)
CORS_ORIGIN=http://localhost:80,http://127.0.0.1:80

# Optional: Logging Configuration
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true

# Optional: Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
EOF
    
    echo "✅ Default .env.staging created"
    echo "⚠️  Please review and update .env.staging with your staging-specific values"
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

# Warn if low on space
AVAILABLE_BYTES=$(df . | awk 'NR==2 {print $4}')
if [ "$AVAILABLE_BYTES" -lt 2097152 ]; then  # Less than 2GB
    echo "⚠️  Warning: Low disk space detected. Consider cleaning up Docker resources."
    echo "   Run 'docker system prune' to free up space"
fi

# Pull latest images (optional, can be skipped for faster startup)
echo ""
echo "🐳 Pulling latest base images..."
docker-compose -f docker-compose.staging.yml pull postgres elasticmq || {
    echo "⚠️  Failed to pull some images, continuing with local images..."
}

# Build services
echo ""
echo "🏗️  Building staging services..."
echo "   This may take several minutes on first run..."

# Build with progress output
docker-compose -f docker-compose.staging.yml build --parallel || {
    echo "❌ Build failed. Check the error messages above."
    exit 1
}

echo "✅ All services built successfully"

# Start services with proper dependency order
echo ""
echo "🚀 Starting staging services..."
echo "   Starting services in dependency order..."

# Start PostgreSQL first
echo "   1. Starting PostgreSQL database..."
docker-compose -f docker-compose.staging.yml up -d postgres

# Wait for PostgreSQL to be healthy
echo "   2. Waiting for PostgreSQL to be ready..."
timeout 120 bash -c 'until docker-compose -f docker-compose.staging.yml exec -T postgres pg_isready -U ${DB_USER:-chinook_user} -d chinook; do sleep 2; done' || {
    echo "❌ PostgreSQL failed to start within 2 minutes"
    echo "   Check logs: docker-compose -f docker-compose.staging.yml logs postgres"
    exit 1
}

echo "   ✅ PostgreSQL is ready"

# Run database migrations
echo "   3. Running database migrations..."
docker-compose -f docker-compose.staging.yml up --no-deps db-migrate || {
    echo "❌ Database migration failed"
    echo "   Check logs: docker-compose -f docker-compose.staging.yml logs db-migrate"
    exit 1
}

echo "   ✅ Database migrations completed"

# Start backend services
echo "   4. Starting backend services..."
docker-compose -f docker-compose.staging.yml up -d auth app catalogos

# Wait for backend services to be healthy
echo "   5. Waiting for backend services to be ready..."
for service in auth app catalogos; do
    echo "      Waiting for $service service..."
    timeout 60 bash -c "until docker-compose -f docker-compose.staging.yml exec -T $service curl -f http://localhost:\$(docker-compose -f docker-compose.staging.yml exec -T $service printenv PORT)/health 2>/dev/null; do sleep 2; done" || {
        echo "❌ $service service failed to start within 1 minute"
        echo "   Check logs: docker-compose -f docker-compose.staging.yml logs $service"
        exit 1
    }
    echo "      ✅ $service service is ready"
done

# Start web service
echo "   6. Starting web frontend..."
docker-compose -f docker-compose.staging.yml up -d web

# Wait for web service to be ready
echo "   7. Waiting for web service to be ready..."
timeout 60 bash -c 'until curl -f http://localhost:80/ 2>/dev/null; do sleep 2; done' || {
    echo "❌ Web service failed to start within 1 minute"
    echo "   Check logs: docker-compose -f docker-compose.staging.yml logs web"
    exit 1
}

echo "   ✅ Web service is ready"

# Start additional services
echo "   8. Starting additional services..."
docker-compose -f docker-compose.staging.yml up -d elasticmq

echo ""
echo "🎉 Staging environment is running!"
echo ""
echo "🌐 Access points:"
echo "   - Web application: http://localhost:80"
echo "   - Auth service: http://localhost:3000"
echo "   - App service: http://localhost:3001"
echo "   - Catalogos service: http://localhost:3002"
echo "   - PostgreSQL: localhost:5432"
echo "   - ElasticMQ: http://localhost:9324"
echo ""
echo "📋 Service status:"
docker-compose -f docker-compose.staging.yml ps

echo ""
echo "📝 Useful commands:"
echo "   - View all logs: docker-compose -f docker-compose.staging.yml logs -f"
echo "   - View service logs: docker-compose -f docker-compose.staging.yml logs -f <service>"
echo "   - Check service health: docker-compose -f docker-compose.staging.yml ps"
echo "   - Execute commands: docker-compose -f docker-compose.staging.yml exec <service> <command>"
echo "   - Scale services: docker-compose -f docker-compose.staging.yml up -d --scale <service>=<count>"
echo ""
echo "🔧 Database commands:"
echo "   - Connect to PostgreSQL: docker-compose -f docker-compose.staging.yml exec postgres psql -U \${DB_USER:-chinook_user} -d chinook"
echo "   - Run migrations: docker-compose -f docker-compose.staging.yml up --no-deps db-migrate"
echo "   - Backup database: docker-compose -f docker-compose.staging.yml exec postgres pg_dump -U \${DB_USER:-chinook_user} chinook > backup.sql"
echo ""
echo "💡 Tips:"
echo "   - Press Ctrl+C to stop all services"
echo "   - Services will restart automatically if they crash"
echo "   - Database data persists in Docker volumes"
echo "   - Use --env-file .env.staging to load environment variables"
echo ""
echo "⏳ Services are running. Press Ctrl+C to stop..."

# Follow logs from all services
echo ""
echo "📊 Following logs from all services (press Ctrl+C to stop)..."
docker-compose -f docker-compose.staging.yml logs -f