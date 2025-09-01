#!/bin/bash

# Integration Testing Script for Production Environment
# Tests production-optimized containerized environment

set -e

echo "🧪 Starting Integration Tests for Production Environment"
echo "======================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Cleanup function
cleanup() {
    print_status "Cleaning up production environment..."
    
    # Stop and remove production containers
    docker-compose -f docker-compose.prod.yml down -v 2>/dev/null || true
    
    # Clean up Docker volumes and networks
    docker volume prune -f 2>/dev/null || true
    docker network prune -f 2>/dev/null || true
    
    print_success "Cleanup completed"
}

# Set trap for cleanup on exit
trap cleanup EXIT

# Step 1: Check prerequisites
print_status "Checking prerequisites..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose >/dev/null 2>&1; then
    print_error "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

print_success "Prerequisites check passed"

# Step 2: Check environment configuration
print_status "Checking production environment configuration..."

# Create production environment file if it doesn't exist
if [ ! -f ".env.production" ]; then
    print_status "Creating production environment file..."
    cat > .env.production << EOF
JWT_SECREAT_KEY=production_jwt_secret_key_for_integration_testing_minimum_32_chars
DB_USER=chinook_user
DB_PASSWORD=production_db_password_for_integration_testing
CORS_ORIGIN=http://localhost:80,http://localhost:443
EOF
    print_success "Production environment file created"
else
    print_success "Production environment file found"
fi

# Step 3: Start production environment
print_status "Starting production environment..."
print_warning "This may take several minutes for production-optimized containers..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Step 4: Wait for all services to be healthy (longer timeouts for production)
print_status "Waiting for services to be healthy (production startup takes longer)..."

# Wait for PostgreSQL
print_status "Waiting for PostgreSQL..."
for i in {1..120}; do
    if docker exec chinook-postgres-prod pg_isready -U chinook_user -d chinook >/dev/null 2>&1; then
        break
    fi
    sleep 3
done

if ! docker exec chinook-postgres-prod pg_isready -U chinook_user -d chinook >/dev/null 2>&1; then
    print_error "PostgreSQL failed to start"
    exit 1
fi
print_success "PostgreSQL is ready"

# Wait for Redis
print_status "Waiting for Redis..."
for i in {1..60}; do
    if docker exec chinook-redis-prod redis-cli ping >/dev/null 2>&1; then
        break
    fi
    sleep 2
done

if ! docker exec chinook-redis-prod redis-cli ping >/dev/null 2>&1; then
    print_error "Redis failed to start"
    exit 1
fi
print_success "Redis is ready"

# Wait for auth service
print_status "Waiting for auth service..."
for i in {1..120}; do
    if curl -s http://localhost:3000/health >/dev/null 2>&1; then
        break
    fi
    sleep 3
done

if ! curl -s http://localhost:3000/health >/dev/null 2>&1; then
    print_error "Auth service failed to start"
    exit 1
fi
print_success "Auth service is ready"

# Wait for app service
print_status "Waiting for app service..."
for i in {1..120}; do
    if curl -s http://localhost:3001/health >/dev/null 2>&1; then
        break
    fi
    sleep 3
done

if ! curl -s http://localhost:3001/health >/dev/null 2>&1; then
    print_error "App service failed to start"
    exit 1
fi
print_success "App service is ready"

# Wait for catalogos service
print_status "Waiting for catalogos service..."
for i in {1..120}; do
    if curl -s http://localhost:3002/health >/dev/null 2>&1; then
        break
    fi
    sleep 3
done

if ! curl -s http://localhost:3002/health >/dev/null 2>&1; then
    print_error "Catalogos service failed to start"
    exit 1
fi
print_success "Catalogos service is ready"

# Wait for web service
print_status "Waiting for web service..."
for i in {1..120}; do
    if curl -s http://localhost:80/ >/dev/null 2>&1; then
        break
    fi
    sleep 3
done

if ! curl -s http://localhost:80/ >/dev/null 2>&1; then
    print_error "Web service failed to start"
    exit 1
fi
print_success "Web service is ready"

# Step 5: Install Playwright dependencies
print_status "Installing Playwright dependencies..."
cd web
npm install >/dev/null 2>&1
npx playwright install >/dev/null 2>&1
cd ..

# Step 6: Run integration tests
print_status "Running integration tests for production environment..."
cd web

# Run production-specific integration tests
npm run test:e2e:production

TEST_EXIT_CODE=$?

cd ..

# Step 7: Report results
if [ $TEST_EXIT_CODE -eq 0 ]; then
    print_success "All integration tests passed!"
    echo ""
    echo "🎉 Production Environment Integration Tests: PASSED"
    echo "=================================================="
    echo "✅ Service Communication: OK"
    echo "✅ PostgreSQL Database: OK"
    echo "✅ Redis Cache: OK"
    echo "✅ Container Orchestration: OK"
    echo "✅ Production Optimizations: OK"
    echo "✅ Security Configuration: OK"
    echo "✅ Resource Limits: OK"
    echo "✅ Complete Workflows: OK"
    echo "✅ Environment Configuration: OK"
else
    print_error "Some integration tests failed!"
    echo ""
    echo "❌ Production Environment Integration Tests: FAILED"
    echo "=================================================="
    echo "Check the test output above for details."
    exit 1
fi