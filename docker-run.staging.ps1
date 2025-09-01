# Staging Environment Startup Script (PowerShell)
# This script starts the full containerized staging environment

param(
    [switch]$Clean = $false,
    [switch]$NoBuild = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Chinook Application - Staging Environment" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Error: Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is available
try {
    docker-compose --version | Out-Null
} catch {
    Write-Host "❌ Error: docker-compose is not installed. Please install Docker Compose and try again." -ForegroundColor Red
    exit 1
}

# Check if .env.staging file exists
if (-not (Test-Path ".env.staging")) {
    Write-Host "⚠️  Warning: .env.staging file not found. Creating from template..." -ForegroundColor Yellow
    if (Test-Path ".env.staging.template") {
        Copy-Item ".env.staging.template" ".env.staging"
        Write-Host "✅ Created .env.staging from template. Please review and update the values." -ForegroundColor Green
    } else {
        Write-Host "❌ Error: .env.staging.template not found. Please create .env.staging manually." -ForegroundColor Red
        exit 1
    }
}

# Validate required environment variables
Write-Host "🔍 Validating environment configuration..." -ForegroundColor Cyan

$envContent = Get-Content ".env.staging" | Where-Object { $_ -match "^[^#].*=" }
$envVars = @{}
foreach ($line in $envContent) {
    $parts = $line -split "=", 2
    if ($parts.Length -eq 2) {
        $envVars[$parts[0].Trim()] = $parts[1].Trim()
    }
}

if (-not $envVars["JWT_SECREAT_KEY"] -or $envVars["JWT_SECREAT_KEY"] -eq "staging_jwt_secret_key_change_in_production_environment") {
    Write-Host "⚠️  Warning: JWT_SECREAT_KEY is using default value. Please update it in .env.staging" -ForegroundColor Yellow
}

if (-not $envVars["DB_PASSWORD"] -or $envVars["DB_PASSWORD"] -eq "secure_staging_password_change_me") {
    Write-Host "⚠️  Warning: DB_PASSWORD is using default value. Please update it in .env.staging" -ForegroundColor Yellow
}

# Clean up any existing containers (if requested)
if ($Clean) {
    Write-Host "🧹 Cleaning up existing containers..." -ForegroundColor Cyan
    docker-compose -f docker-compose.staging.yml --env-file .env.staging down --remove-orphans
}

# Pull latest images
Write-Host "📥 Pulling latest base images..." -ForegroundColor Cyan
docker-compose -f docker-compose.staging.yml --env-file .env.staging pull postgres elasticmq

# Build and start services
Write-Host "🏗️  Building and starting services..." -ForegroundColor Cyan
Write-Host "This may take a few minutes on first run..." -ForegroundColor Yellow

# Start services with proper dependency order
if ($NoBuild) {
    docker-compose -f docker-compose.staging.yml --env-file .env.staging up -d
} else {
    docker-compose -f docker-compose.staging.yml --env-file .env.staging up -d --build
}

# Wait for services to be healthy
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Check service health
Write-Host "🏥 Checking service health..." -ForegroundColor Cyan

# Function to check if a service is healthy
function Test-ServiceHealth {
    param(
        [string]$ServiceName,
        [int]$MaxAttempts = 30
    )
    
    for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
        $status = docker-compose -f docker-compose.staging.yml --env-file .env.staging ps $ServiceName
        if ($status -match "healthy|Up") {
            Write-Host "✅ $ServiceName is ready" -ForegroundColor Green
            return $true
        }
        Write-Host "⏳ Waiting for $ServiceName... (attempt $attempt/$MaxAttempts)" -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
    
    Write-Host "❌ $ServiceName failed to become healthy" -ForegroundColor Red
    return $false
}

# Check each service
$services = @("postgres", "auth", "app", "catalogos", "web")
$allHealthy = $true

foreach ($service in $services) {
    if (-not (Test-ServiceHealth -ServiceName $service)) {
        $allHealthy = $false
    }
}

if ($allHealthy) {
    Write-Host ""
    Write-Host "🎉 All services are running successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Service Information:" -ForegroundColor Cyan
    Write-Host "======================"
    Write-Host "🌐 Web Frontend:      http://localhost:80" -ForegroundColor White
    Write-Host "🔐 Auth Service:      http://localhost:3000" -ForegroundColor White
    Write-Host "📱 App Service:       http://localhost:3001" -ForegroundColor White
    Write-Host "📚 Catalogos Service: http://localhost:3002" -ForegroundColor White
    Write-Host "🗄️  PostgreSQL:       localhost:5432" -ForegroundColor White
    Write-Host "📨 ElasticMQ:         http://localhost:9324" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Container Status:" -ForegroundColor Cyan
    docker-compose -f docker-compose.staging.yml --env-file .env.staging ps
    Write-Host ""
    Write-Host "📝 To view logs: docker-compose -f docker-compose.staging.yml logs -f [service_name]" -ForegroundColor Yellow
    Write-Host "🛑 To stop: docker-compose -f docker-compose.staging.yml down" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Some services failed to start properly." -ForegroundColor Red
    Write-Host "📋 Current container status:" -ForegroundColor Cyan
    docker-compose -f docker-compose.staging.yml --env-file .env.staging ps
    Write-Host ""
    Write-Host "📝 Check logs with: docker-compose -f docker-compose.staging.yml logs [service_name]" -ForegroundColor Yellow
    exit 1
}