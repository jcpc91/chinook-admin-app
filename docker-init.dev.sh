#!/bin/bash

# Docker Development Environment Initialization Script
# This script sets up a hybrid development environment where:
# - Web frontend runs in a Docker container
# - Backend services (auth, app, catalogos) run locally
# - Database uses local SQLite files

set -e  # Exit on any error

echo "🚀 Initializing hybrid development environment..."
echo "   - Web service: Containerized (Docker)"
echo "   - Backend services: Local (auth, app, catalogos)"
echo "   - Database: Local SQLite files"
echo ""

# Function to generate a random JWT secret
generate_jwt_secret() {
    if command -v openssl >/dev/null 2>&1; then
        openssl rand -hex 32
    elif command -v node >/dev/null 2>&1; then
        node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    else
        # Fallback to a default secret (not recommended for production)
        echo "dev_jwt_secret_$(date +%s)"
    fi
}

# Generate JWT secret
JWT_SECRET=$(generate_jwt_secret)
echo "📝 Generated JWT secret: ${JWT_SECRET:0:8}..."

# Initialize database and install dependencies
echo ""
echo "📊 Setting up database and migrations..."
cd database
npm install --loglevel=error
npm run migrate-app --loglevel=error
npm run migrate-auth --loglevel=error
npm run migrate-cat --loglevel=error
echo "✅ Database initialized successfully"
cd ..

# Install global dependencies
echo ""
echo "🌐 Installing global dependencies..."
if ! command -v chance >/dev/null 2>&1; then
    npm install -g chance-cli --loglevel=error
    echo "✅ chance-cli installed globally"
else
    echo "✅ chance-cli already installed"
fi

# Setup web service (containerized)
echo ""
echo "🌐 Setting up web service (containerized)..."
cd web
npm install --loglevel=error

# Create development environment file for containerized web
cat > .env.development << EOF
# Web Service Development Environment (Containerized)
# This configuration allows the containerized web service to communicate
# with local backend services running on the host machine

VITE_MODE=desarrollo
VITE_BASE_URL=http://host.docker.internal:3001
VITE_URL_AUTH=http://host.docker.internal:3000
VITE_CATALOGOS_URL=http://host.docker.internal:3002
VITE_PORT=5173
VITE_PREVIEW_PORT=4173
VITE_USE_PROXY=false
VITE_CORS_ORIGIN=http://localhost:5173,http://host.docker.internal:5173,http://127.0.0.1:5173
VITE_API_TIMEOUT=10000
VITE_AUTH_TIMEOUT=5000
VITE_ENABLE_DEBUG=true
VITE_LOG_LEVEL=info
VITE_SECURE_COOKIES=false
VITE_ENABLE_HTTPS=false
EOF

echo "✅ Web service configured for containerized development"
cd ..

# Setup auth service (local)
echo ""
echo "🔐 Setting up auth service (local)..."
cd auth
npm install --loglevel=error

cat > .env << EOF
# Auth Service Development Environment (Local)
# This service runs locally and communicates with containerized web service

CORS_ORIGIN=http://localhost:5173,http://host.docker.internal:5173,http://127.0.0.1:5173
JWT_SECREAT_KEY=$JWT_SECRET
PORT=3000
NODE_ENV=development
DB_TYPE=sqlite3
DB_PATH=../.db/
EOF

echo "✅ Auth service configured for local development"
cd ..

# Setup app service (local)
echo ""
echo "📱 Setting up app service (local)..."
cd app
npm install --loglevel=error

cat > .env << EOF
# App Service Development Environment (Local)
# This service runs locally and communicates with containerized web service

CORS_ORIGIN=http://localhost:5173,http://host.docker.internal:5173,http://127.0.0.1:5173
JWT_SECREAT_KEY=$JWT_SECRET
PORT=3001
NODE_ENV=development
DB_TYPE=sqlite3
DB_PATH=../.db/
AUTH_SERVICE_URL=http://localhost:3000
CATALOGOS_SERVICE_URL=http://localhost:3002
EOF

echo "✅ App service configured for local development"
cd ..

# Setup catalogos service (local)
echo ""
echo "📚 Setting up catalogos service (local)..."
cd catalogos
npm install --loglevel=error

cat > .env << EOF
# Catalogos Service Development Environment (Local)
# This service runs locally and communicates with containerized web service

CORS_ORIGIN=http://localhost:5173,http://host.docker.internal:5173,http://127.0.0.1:5173
JWT_SECREAT_KEY=$JWT_SECRET
PORT=3002
NODE_ENV=development
DB_TYPE=sqlite3
DB_PATH=../.db/
AUTH_SERVICE_URL=http://localhost:3000
APP_SERVICE_URL=http://localhost:3001
EOF

echo "✅ Catalogos service configured for local development"
cd ..

# Create root environment file for Docker Compose
echo ""
echo "🐳 Creating Docker Compose environment configuration..."
cat > .env << EOF
# Docker Compose Environment Variables for Development
# This file is used by docker-compose.dev.yml

# JWT Configuration (shared across all services)
JWT_SECREAT_KEY=$JWT_SECRET

# CORS Configuration for hybrid development
CORS_ORIGIN=http://localhost:5173,http://host.docker.internal:5173,http://127.0.0.1:5173

# Development-specific Web Environment Variables
VITE_MODE_DEV=desarrollo
VITE_BASE_URL_DEV=http://host.docker.internal:3001
VITE_URL_AUTH_DEV=http://host.docker.internal:3000
VITE_CATALOGOS_URL_DEV=http://host.docker.internal:3002
VITE_CORS_ORIGIN_DEV=http://localhost:5173,http://host.docker.internal:5173,http://127.0.0.1:5173
EOF

echo "✅ Docker Compose environment configured"

# Configure git (if not already configured)
echo ""
echo "🔧 Configuring git settings..."
if [ -z "$(git config --local user.name 2>/dev/null)" ]; then
    git config --local user.name "Developer"
    echo "✅ Git user.name set to 'Developer'"
else
    echo "✅ Git user.name already configured: $(git config --local user.name)"
fi

if [ -z "$(git config --local user.email 2>/dev/null)" ]; then
    git config --local user.email "developer@localhost"
    echo "✅ Git user.email set to 'developer@localhost'"
else
    echo "✅ Git user.email already configured: $(git config --local user.email)"
fi

# Verify Docker is available
echo ""
echo "🐳 Verifying Docker availability..."
if ! command -v docker >/dev/null 2>&1; then
    echo "❌ Docker is not installed or not in PATH"
    echo "   Please install Docker to use the containerized web service"
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker daemon is not running"
    echo "   Please start Docker to use the containerized web service"
    exit 1
fi

echo "✅ Docker is available and running"

# Build web container
echo ""
echo "🏗️  Building web service container..."
docker-compose -f docker-compose.dev.yml build web
echo "✅ Web service container built successfully"

echo ""
echo "🎉 Hybrid development environment initialized successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Start the containerized web service:"
echo "      docker-compose -f docker-compose.dev.yml up web"
echo ""
echo "   2. In separate terminals, start the local backend services:"
echo "      cd auth && npm run dev"
echo "      cd app && npm run dev"
echo "      cd catalogos && npm run dev"
echo ""
echo "   3. Or use the provided startup script:"
echo "      ./docker-run.dev.sh"
echo ""
echo "🌐 Access points:"
echo "   - Web application: http://localhost:5173"
echo "   - Auth service: http://localhost:3000"
echo "   - App service: http://localhost:3001"
echo "   - Catalogos service: http://localhost:3002"
echo ""
echo "💡 The web service runs in a container and communicates with"
echo "   local backend services via host.docker.internal"