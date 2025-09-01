# Docker Development Environment Initialization Script (PowerShell)
# This script sets up a hybrid development environment where:
# - Web frontend runs in a Docker container
# - Backend services (auth, app, catalogos) run locally
# - Database uses local SQLite files

$ErrorActionPreference = "Stop"

Write-Host "🚀 Initializing hybrid development environment..." -ForegroundColor Green
Write-Host "   - Web service: Containerized (Docker)" -ForegroundColor Cyan
Write-Host "   - Backend services: Local (auth, app, catalogos)" -ForegroundColor Cyan
Write-Host "   - Database: Local SQLite files" -ForegroundColor Cyan
Write-Host ""

# Function to generate a random JWT secret
function Generate-JwtSecret {
    try {
        # Try using .NET crypto
        $bytes = New-Object byte[] 32
        $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::Create()
        $rng.GetBytes($bytes)
        $rng.Dispose()
        return [System.BitConverter]::ToString($bytes).Replace("-", "").ToLower()
    }
    catch {
        # Fallback to timestamp-based secret
        $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
        return "dev_jwt_secret_$timestamp"
    }
}

# Generate JWT secret
$jwtSecret = Generate-JwtSecret
Write-Host "📝 Generated JWT secret: $($jwtSecret.Substring(0, 8))..." -ForegroundColor Yellow

# Initialize database and install dependencies
Write-Host ""
Write-Host "📊 Setting up database and migrations..." -ForegroundColor Green
Set-Location database
npm install --loglevel=error
npm run migrate-app --loglevel=error
npm run migrate-auth --loglevel=error
npm run migrate-cat --loglevel=error
Write-Host "✅ Database initialized successfully" -ForegroundColor Green
Set-Location ..

# Install global dependencies
Write-Host ""
Write-Host "🌐 Installing global dependencies..." -ForegroundColor Green
try {
    $chanceInstalled = Get-Command chance -ErrorAction SilentlyContinue
    if (-not $chanceInstalled) {
        npm install -g chance-cli --loglevel=error
        Write-Host "✅ chance-cli installed globally" -ForegroundColor Green
    }
    else {
        Write-Host "✅ chance-cli already installed" -ForegroundColor Green
    }
}
catch {
    Write-Host "⚠️  Could not install chance-cli globally" -ForegroundColor Yellow
}

# Setup web service (containerized)
Write-Host ""
Write-Host "🌐 Setting up web service (containerized)..." -ForegroundColor Green
Set-Location web
npm install --loglevel=error

# Create development environment file for containerized web
$webEnvContent = @"
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
"@

$webEnvContent | Out-File -FilePath ".env.development" -Encoding UTF8
Write-Host "✅ Web service configured for containerized development" -ForegroundColor Green
Set-Location ..

# Setup auth service (local)
Write-Host ""
Write-Host "🔐 Setting up auth service (local)..." -ForegroundColor Green
Set-Location auth
npm install --loglevel=error

$authEnvContent = @"
# Auth Service Development Environment (Local)
# This service runs locally and communicates with containerized web service

CORS_ORIGIN=http://localhost:5173,http://host.docker.internal:5173,http://127.0.0.1:5173
JWT_SECREAT_KEY=$jwtSecret
PORT=3000
NODE_ENV=development
DB_TYPE=sqlite3
DB_PATH=../.db/
"@

$authEnvContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "✅ Auth service configured for local development" -ForegroundColor Green
Set-Location ..

# Setup app service (local)
Write-Host ""
Write-Host "📱 Setting up app service (local)..." -ForegroundColor Green
Set-Location app
npm install --loglevel=error

$appEnvContent = @"
# App Service Development Environment (Local)
# This service runs locally and communicates with containerized web service

CORS_ORIGIN=http://localhost:5173,http://host.docker.internal:5173,http://127.0.0.1:5173
JWT_SECREAT_KEY=$jwtSecret
PORT=3001
NODE_ENV=development
DB_TYPE=sqlite3
DB_PATH=../.db/
AUTH_SERVICE_URL=http://localhost:3000
CATALOGOS_SERVICE_URL=http://localhost:3002
"@

$appEnvContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "✅ App service configured for local development" -ForegroundColor Green
Set-Location ..

# Setup catalogos service (local)
Write-Host ""
Write-Host "📚 Setting up catalogos service (local)..." -ForegroundColor Green
Set-Location catalogos
npm install --loglevel=error

$catalogosEnvContent = @"
# Catalogos Service Development Environment (Local)
# This service runs locally and communicates with containerized web service

CORS_ORIGIN=http://localhost:5173,http://host.docker.internal:5173,http://127.0.0.1:5173
JWT_SECREAT_KEY=$jwtSecret
PORT=3002
NODE_ENV=development
DB_TYPE=sqlite3
DB_PATH=../.db/
AUTH_SERVICE_URL=http://localhost:3000
APP_SERVICE_URL=http://localhost:3001
"@

$catalogosEnvContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "✅ Catalogos service configured for local development" -ForegroundColor Green
Set-Location ..

# Create root environment file for Docker Compose
Write-Host ""
Write-Host "🐳 Creating Docker Compose environment configuration..." -ForegroundColor Green

$rootEnvContent = @"
# Docker Compose Environment Variables for Development
# This file is used by docker-compose.dev.yml

# JWT Configuration (shared across all services)
JWT_SECREAT_KEY=$jwtSecret

# CORS Configuration for hybrid development
CORS_ORIGIN=http://localhost:5173,http://host.docker.internal:5173,http://127.0.0.1:5173

# Development-specific Web Environment Variables
VITE_MODE_DEV=desarrollo
VITE_BASE_URL_DEV=http://host.docker.internal:3001
VITE_URL_AUTH_DEV=http://host.docker.internal:3000
VITE_CATALOGOS_URL_DEV=http://host.docker.internal:3002
VITE_CORS_ORIGIN_DEV=http://localhost:5173,http://host.docker.internal:5173,http://127.0.0.1:5173
"@

$rootEnvContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "✅ Docker Compose environment configured" -ForegroundColor Green

# Configure git (if not already configured)
Write-Host ""
Write-Host "🔧 Configuring git settings..." -ForegroundColor Green
try {
    $gitUserName = git config --local user.name 2>$null
    if (-not $gitUserName) {
        git config --local user.name "Developer"
        Write-Host "✅ Git user.name set to 'Developer'" -ForegroundColor Green
    }
    else {
        Write-Host "✅ Git user.name already configured: $gitUserName" -ForegroundColor Green
    }

    $gitUserEmail = git config --local user.email 2>$null
    if (-not $gitUserEmail) {
        git config --local user.email "developer@localhost"
        Write-Host "✅ Git user.email set to 'developer@localhost'" -ForegroundColor Green
    }
    else {
        Write-Host "✅ Git user.email already configured: $gitUserEmail" -ForegroundColor Green
    }
}
catch {
    Write-Host "⚠️  Could not configure git settings" -ForegroundColor Yellow
}

# Verify Docker is available
Write-Host ""
Write-Host "🐳 Verifying Docker availability..." -ForegroundColor Green
try {
    $dockerVersion = docker --version 2>$null
    if (-not $dockerVersion) {
        throw "Docker not found"
    }
    
    docker info 2>$null | Out-Null
    Write-Host "✅ Docker is available and running" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker is not installed or not running" -ForegroundColor Red
    Write-Host "   Please install Docker Desktop and ensure it's running" -ForegroundColor Yellow
    exit 1
}

# Build web container
Write-Host ""
Write-Host "🏗️  Building web service container..." -ForegroundColor Green
docker-compose -f docker-compose.dev.yml build web
Write-Host "✅ Web service container built successfully" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Hybrid development environment initialized successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Start the containerized web service:" -ForegroundColor White
Write-Host "      docker-compose -f docker-compose.dev.yml up web" -ForegroundColor Yellow
Write-Host ""
Write-Host "   2. In separate terminals, start the local backend services:" -ForegroundColor White
Write-Host "      cd auth && npm run dev" -ForegroundColor Yellow
Write-Host "      cd app && npm run dev" -ForegroundColor Yellow
Write-Host "      cd catalogos && npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "   3. Or use the provided startup script:" -ForegroundColor White
Write-Host "      ./docker-run.dev.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "🌐 Access points:" -ForegroundColor Cyan
Write-Host "   - Web application: http://localhost:5173" -ForegroundColor White
Write-Host "   - Auth service: http://localhost:3000" -ForegroundColor White
Write-Host "   - App service: http://localhost:3001" -ForegroundColor White
Write-Host "   - Catalogos service: http://localhost:3002" -ForegroundColor White
Write-Host ""
Write-Host "💡 The web service runs in a container and communicates with" -ForegroundColor Cyan
Write-Host "   local backend services via host.docker.internal" -ForegroundColor Cyan