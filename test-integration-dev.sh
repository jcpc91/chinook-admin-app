#!/bin/bash

# Integration Testing Script for Development Environment
# Tests containerized web frontend with local backend services

set -e

echo "🧪 Starting Integration Tests for Development Environment"
echo "=================================================="

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
    print_status "Cleaning up development environment..."
    
    # Stop containerized web service
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    
    # Note: We don't stop local backend services as they might be used for development
    print_warning "Local backend services left running for continued development"
    
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

# Check if Node.js is available
if ! command -v node >/dev/null 2>&1; then
    print_error "Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Check if npm is available
if ! command -v npm >/dev/null 2>&1; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

print_success "Prerequisites check passed"

# Step 2: Initialize local backend services
print_status "Initializing local backend services..."

# Check if databases are initialized
if [ ! -d ".db" ]; then
    print_status "Initializing databases..."
    ./init.sh
else
    print_status "Databases already initialized"
fi

# Start local backend services if not running
print_status "Checking local backend services..."

# Check auth service
if ! curl -s http://localhost:3000/health >/dev/null 2>&1; then
    print_status "Starting auth service..."
    cd auth
    npm install >/dev/null 2>&1
    npm run dev &
    AUTH_PID=$!
    cd ..
    
    # Wait for auth service to start
    for i in {1..30}; do
        if curl -s http://localhost:3000/health >/dev/null 2>&1; then
            break
        fi
        sleep 1
    done
    
    if ! curl -s http://localhost:3000/health >/dev/null 2>&1; then
        print_error "Failed to start auth service"
        exit 1
    fi
    print_success "Auth service started"
else
    print_success "Auth service already running"
fi

# Check app service
if ! curl -s http://localhost:3001/health >/dev/null 2>&1; then
    print_status "Starting app service..."
    cd app
    npm install >/dev/null 2>&1
    npm run dev &
    APP_PID=$!
    cd ..
    
    # Wait for app service to start
    for i in {1..30}; do
        if curl -s http://localhost:3001/health >/dev/null 2>&1; then
            break
        fi
        sleep 1
    done
    
    if ! curl -s http://localhost:3001/health >/dev/null 2>&1; then
        print_error "Failed to start app service"
        exit 1
    fi
    print_success "App service started"
else
    print_success "App service already running"
fi

# Check catalogos service
if ! curl -s http://localhost:3002/health >/dev/null 2>&1; then
    print_status "Starting catalogos service..."
    cd catalogos
    npm install >/dev/null 2>&1
    npm run dev &
    CATALOGOS_PID=$!
    cd ..
    
    # Wait for catalogos service to start
    for i in {1..30}; do
        if curl -s http://localhost:3002/health >/dev/null 2>&1; then
            break
        fi
        sleep 1
    done
    
    if ! curl -s http://localhost:3002/health >/dev/null 2>&1; then
        print_error "Failed to start catalogos service"
        exit 1
    fi
    print_success "Catalogos service started"
else
    print_success "Catalogos service already running"
fi

# Step 3: Start containerized web service
print_status "Starting containerized web service..."
docker-compose -f docker-compose.dev.yml up -d web

# Wait for web service to be ready
print_status "Waiting for web service to be ready..."
for i in {1..60}; do
    if curl -s http://localhost:5173/ >/dev/null 2>&1; then
        break
    fi
    sleep 2
done

if ! curl -s http://localhost:5173/ >/dev/null 2>&1; then
    print_error "Web service failed to start"
    exit 1
fi

print_success "Web service is ready"

# Step 4: Install Playwright dependencies
print_status "Installing Playwright dependencies..."
cd web
npm install >/dev/null 2>&1
npx playwright install >/dev/null 2>&1
cd ..

# Step 5: Run integration tests
print_status "Running integration tests for development environment..."
cd web

# Run development-specific integration tests
npm run test:e2e:dev

TEST_EXIT_CODE=$?

cd ..

# Step 6: Report results
if [ $TEST_EXIT_CODE -eq 0 ]; then
    print_success "All integration tests passed!"
    echo ""
    echo "🎉 Development Environment Integration Tests: PASSED"
    echo "=================================================="
    echo "✅ Service Communication: OK"
    echo "✅ CORS Configuration: OK"
    echo "✅ Database Connectivity: OK"
    echo "✅ Complete Workflows: OK"
    echo "✅ Environment Configuration: OK"
else
    print_error "Some integration tests failed!"
    echo ""
    echo "❌ Development Environment Integration Tests: FAILED"
    echo "=================================================="
    echo "Check the test output above for details."
    exit 1
fi