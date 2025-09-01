#!/bin/bash

# Docker Development Environment Startup Script
# This script starts a hybrid development environment where:
# - Web frontend runs in a Docker container
# - Backend services (auth, app, catalogos) run locally
# - Database uses local SQLite files

set -e  # Exit on any error

echo "🚀 Starting hybrid development environment..."
echo "   - Web service: Containerized (Docker)"
echo "   - Backend services: Local (auth, app, catalogos)"
echo "   - Database: Local SQLite files"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    if command_exists netstat; then
        netstat -tuln | grep -q ":$1 "
    elif command_exists ss; then
        ss -tuln | grep -q ":$1 "
    else
        # Fallback: try to connect to the port
        timeout 1 bash -c "</dev/tcp/localhost/$1" 2>/dev/null
    fi
}

# Function to wait for a service to be ready
wait_for_service() {
    local service_name="$1"
    local port="$2"
    local max_attempts=30
    local attempt=1

    echo "⏳ Waiting for $service_name to be ready on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if port_in_use "$port"; then
            echo "✅ $service_name is ready on port $port"
            return 0
        fi
        
        echo "   Attempt $attempt/$max_attempts - $service_name not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service_name failed to start within expected time"
    return 1
}

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    
    # Stop Docker Compose services
    if [ -f docker-compose.dev.yml ]; then
        echo "   Stopping containerized web service..."
        docker-compose -f docker-compose.dev.yml down --remove-orphans
    fi
    
    # Kill background processes
    if [ -n "$AUTH_PID" ] && kill -0 "$AUTH_PID" 2>/dev/null; then
        echo "   Stopping auth service (PID: $AUTH_PID)..."
        kill "$AUTH_PID" 2>/dev/null || true
    fi
    
    if [ -n "$APP_PID" ] && kill -0 "$APP_PID" 2>/dev/null; then
        echo "   Stopping app service (PID: $APP_PID)..."
        kill "$APP_PID" 2>/dev/null || true
    fi
    
    if [ -n "$CATALOGOS_PID" ] && kill -0 "$CATALOGOS_PID" 2>/dev/null; then
        echo "   Stopping catalogos service (PID: $CATALOGOS_PID)..."
        kill "$CATALOGOS_PID" 2>/dev/null || true
    fi
    
    # Wait a moment for graceful shutdown
    sleep 2
    
    # Force kill if still running
    jobs -p | xargs -r kill -9 2>/dev/null || true
    
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers for graceful shutdown
trap cleanup SIGINT SIGTERM EXIT

# Verify prerequisites
echo "🔍 Verifying prerequisites..."

# Check if Docker is available
if ! command_exists docker; then
    echo "❌ Docker is not installed or not in PATH"
    echo "   Please install Docker to use the containerized web service"
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker daemon is not running"
    echo "   Please start Docker to use the containerized web service"
    exit 1
fi

# Check if docker-compose is available
if ! command_exists docker-compose; then
    echo "❌ docker-compose is not installed or not in PATH"
    echo "   Please install docker-compose"
    exit 1
fi

# Check if required files exist
if [ ! -f docker-compose.dev.yml ]; then
    echo "❌ docker-compose.dev.yml not found"
    echo "   Please run ./docker-init.dev.sh first to initialize the environment"
    exit 1
fi

# Check if services have been initialized
for service in auth app catalogos; do
    if [ ! -f "$service/.env" ]; then
        echo "❌ $service/.env not found"
        echo "   Please run ./docker-init.dev.sh first to initialize the environment"
        exit 1
    fi
    
    if [ ! -d "$service/node_modules" ]; then
        echo "❌ $service/node_modules not found"
        echo "   Please run ./docker-init.dev.sh first to initialize the environment"
        exit 1
    fi
done

echo "✅ All prerequisites verified"

# Check for port conflicts
echo ""
echo "🔍 Checking for port conflicts..."
PORTS_TO_CHECK="3000 3001 3002 5173"
CONFLICTS_FOUND=false

for port in $PORTS_TO_CHECK; do
    if port_in_use "$port"; then
        echo "⚠️  Port $port is already in use"
        CONFLICTS_FOUND=true
    fi
done

if [ "$CONFLICTS_FOUND" = true ]; then
    echo ""
    echo "❌ Port conflicts detected. Please stop services using the above ports and try again."
    echo "   You can find processes using ports with: lsof -i :PORT_NUMBER"
    exit 1
fi

echo "✅ No port conflicts detected"

# Start backend services locally
echo ""
echo "🔧 Starting local backend services..."

# Start auth service
echo "   Starting auth service on port 3000..."
cd auth
npm run dev > ../logs/auth.log 2>&1 &
AUTH_PID=$!
cd ..
echo "   Auth service started (PID: $AUTH_PID)"

# Start app service
echo "   Starting app service on port 3001..."
cd app
npm run dev > ../logs/app.log 2>&1 &
APP_PID=$!
cd ..
echo "   App service started (PID: $APP_PID)"

# Start catalogos service
echo "   Starting catalogos service on port 3002..."
cd catalogos
npm run dev > ../logs/catalogos.log 2>&1 &
CATALOGOS_PID=$!
cd ..
echo "   Catalogos service started (PID: $CATALOGOS_PID)"

# Create logs directory if it doesn't exist
mkdir -p logs

# Wait for backend services to be ready
wait_for_service "Auth service" 3000
wait_for_service "App service" 3001
wait_for_service "Catalogos service" 3002

# Start containerized web service
echo ""
echo "🐳 Starting containerized web service..."
echo "   Building and starting web container..."

# Start Docker Compose in the background
docker-compose -f docker-compose.dev.yml up --build web &
DOCKER_PID=$!

# Wait for web service to be ready
wait_for_service "Web service" 5173

echo ""
echo "🎉 Hybrid development environment is running!"
echo ""
echo "🌐 Access points:"
echo "   - Web application: http://localhost:5173"
echo "   - Auth service: http://localhost:3000"
echo "   - App service: http://localhost:3001"
echo "   - Catalogos service: http://localhost:3002"
echo ""
echo "📋 Service status:"
echo "   - Web (containerized): Running in Docker"
echo "   - Auth (local): PID $AUTH_PID"
echo "   - App (local): PID $APP_PID"
echo "   - Catalogos (local): PID $CATALOGOS_PID"
echo ""
echo "📝 Logs:"
echo "   - Auth: logs/auth.log"
echo "   - App: logs/app.log"
echo "   - Catalogos: logs/catalogos.log"
echo "   - Web: docker-compose -f docker-compose.dev.yml logs web"
echo ""
echo "💡 Tips:"
echo "   - Press Ctrl+C to stop all services"
echo "   - Backend services support hot reload"
echo "   - Web service supports hot reload via volume mounts"
echo "   - Use 'docker-compose -f docker-compose.dev.yml logs -f web' to follow web logs"
echo ""
echo "⏳ Services are running. Press Ctrl+C to stop..."

# Wait for Docker Compose process
wait $DOCKER_PID