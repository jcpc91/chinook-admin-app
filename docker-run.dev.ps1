# Development Environment Startup Script (PowerShell)
# Starts the hybrid development environment:
# - Local backend services (auth, app, catalogos)
# - Containerized web frontend service

param(
    [switch]$NoLogs = $false
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Global variables for process management
$global:AuthProcess = $null
$global:AppProcess = $null
$global:CatalogosProcess = $null
$global:DockerProcess = $null

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to cleanup processes on exit
function Stop-AllServices {
    Write-Status "Shutting down services..."
    
    # Stop Docker Compose services
    if (Test-Path "docker-compose.dev.yml") {
        try {
            docker-compose -f docker-compose.dev.yml down
            Write-Success "Docker services stopped"
        } catch {
            Write-Warning "Failed to stop Docker services: $_"
        }
    }
    
    # Stop local Node.js processes
    if ($global:AuthProcess -and -not $global:AuthProcess.HasExited) {
        $global:AuthProcess.Kill()
        Write-Success "Auth service stopped"
    }
    
    if ($global:AppProcess -and -not $global:AppProcess.HasExited) {
        $global:AppProcess.Kill()
        Write-Success "App service stopped"
    }
    
    if ($global:CatalogosProcess -and -not $global:CatalogosProcess.HasExited) {
        $global:CatalogosProcess.Kill()
        Write-Success "Catalogos service stopped"
    }
    
    Write-Success "All services stopped"
}

# Set up signal handler for graceful shutdown
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
    Stop-AllServices
}

# Handle Ctrl+C
[Console]::TreatControlCAsInput = $false
[Console]::CancelKeyPress += {
    param($sender, $e)
    $e.Cancel = $true
    Stop-AllServices
    exit 0
}

Write-Host "🚀 Starting Chinook Development Environment (Hybrid Mode)" -ForegroundColor Blue
Write-Host "========================================================" -ForegroundColor Blue
Write-Host "Frontend: Containerized (Docker) - http://localhost:5173" -ForegroundColor Green
Write-Host "Backend Services: Local processes" -ForegroundColor Green
Write-Host "  - Auth: http://localhost:3000" -ForegroundColor White
Write-Host "  - App: http://localhost:3001" -ForegroundColor White
Write-Host "  - Catalogos: http://localhost:3002 (if available)" -ForegroundColor White
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Success "Docker is running"
} catch {
    Write-Error "Docker is not running. Please start Docker and try again."
    exit 1
}

# Check if initialization has been run
if (-not (Test-Path "docker-compose.dev.yml")) {
    Write-Error "Development configuration not found. Please run .\docker-init.dev.ps1 first."
    exit 1
}

Write-Status "Step 1: Starting local backend services..."

# Create logs directory if it doesn't exist
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}

# Start auth service
if ((Test-Path "auth") -and (Test-Path "auth/package.json")) {
    Write-Status "Starting auth service on port 3000..."
    Set-Location auth
    
    if (-not (Test-Path ".env")) {
        Write-Warning "Auth .env file not found, creating default..."
        @"
CORS_ORIGIN=http://localhost:5173,http://host.docker.internal:5173
JWT_SECREAT_KEY=dev-secret-key-change-in-production
PORT=3000
NODE_ENV=development
"@ | Out-File -FilePath ".env" -Encoding UTF8
    }
    
    $global:AuthProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -RedirectStandardOutput "../logs/auth.log" -RedirectStandardError "../logs/auth-error.log"
    Set-Location ..
    Write-Success "Auth service started (PID: $($global:AuthProcess.Id))"
} else {
    Write-Warning "Auth service not found or not properly initialized"
}

# Start app service
if ((Test-Path "app") -and (Test-Path "app/package.json")) {
    Write-Status "Starting app service on port 3001..."
    Set-Location app
    
    if (-not (Test-Path ".env")) {
        Write-Warning "App .env file not found, creating default..."
        @"
CORS_ORIGIN=http://localhost:5173,http://host.docker.internal:5173
JWT_SECREAT_KEY=dev-secret-key-change-in-production
PORT=3001
NODE_ENV=development
"@ | Out-File -FilePath ".env" -Encoding UTF8
    }
    
    $global:AppProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -RedirectStandardOutput "../logs/app.log" -RedirectStandardError "../logs/app-error.log"
    Set-Location ..
    Write-Success "App service started (PID: $($global:AppProcess.Id))"
} else {
    Write-Warning "App service not found or not properly initialized"
}

# Start catalogos service if it exists
if ((Test-Path "catalogos") -and (Test-Path "catalogos/package.json")) {
    Write-Status "Starting catalogos service on port 3002..."
    Set-Location catalogos
    
    if (-not (Test-Path ".env")) {
        Write-Warning "Catalogos .env file not found, creating default..."
        @"
CORS_ORIGIN=http://localhost:5173,http://host.docker.internal:5173
JWT_SECREAT_KEY=dev-secret-key-change-in-production
PORT=3002
NODE_ENV=development
"@ | Out-File -FilePath ".env" -Encoding UTF8
    }
    
    $global:CatalogosProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -RedirectStandardOutput "../logs/catalogos.log" -RedirectStandardError "../logs/catalogos-error.log"
    Set-Location ..
    Write-Success "Catalogos service started (PID: $($global:CatalogosProcess.Id))"
} else {
    Write-Warning "Catalogos service not found, skipping..."
}

# Wait a moment for services to start
Write-Status "Waiting for backend services to initialize..."
Start-Sleep -Seconds 3

Write-Status "Step 2: Starting containerized web service..."

# Start the containerized web service
$global:DockerProcess = Start-Process -FilePath "docker-compose" -ArgumentList "-f", "docker-compose.dev.yml", "up", "--build" -PassThru

Write-Success "🎉 All services started successfully!"
Write-Host ""
Write-Host "Service Status:" -ForegroundColor Yellow
Write-Host "===============" -ForegroundColor Yellow
Write-Host "✅ Web Frontend (Containerized): http://localhost:5173" -ForegroundColor Green

if ($global:AuthProcess -and -not $global:AuthProcess.HasExited) {
    Write-Host "✅ Auth Service (Local): http://localhost:3000" -ForegroundColor Green
}

if ($global:AppProcess -and -not $global:AppProcess.HasExited) {
    Write-Host "✅ App Service (Local): http://localhost:3001" -ForegroundColor Green
}

if ($global:CatalogosProcess -and -not $global:CatalogosProcess.HasExited) {
    Write-Host "✅ Catalogos Service (Local): http://localhost:3002" -ForegroundColor Green
}

Write-Host ""
Write-Host "Logs:" -ForegroundColor Yellow
Write-Host "=====" -ForegroundColor Yellow
Write-Host "📋 Web service: docker-compose -f docker-compose.dev.yml logs -f web" -ForegroundColor Cyan

if ($global:AuthProcess) {
    Write-Host "📋 Auth service: Get-Content logs/auth.log -Wait" -ForegroundColor Cyan
}

if ($global:AppProcess) {
    Write-Host "📋 App service: Get-Content logs/app.log -Wait" -ForegroundColor Cyan
}

if ($global:CatalogosProcess) {
    Write-Host "📋 Catalogos service: Get-Content logs/catalogos.log -Wait" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Wait for processes to complete or user interruption
try {
    while ($true) {
        Start-Sleep -Seconds 1
        
        # Check if any critical process has exited unexpectedly
        if ($global:DockerProcess -and $global:DockerProcess.HasExited) {
            Write-Warning "Docker process has exited"
            break
        }
    }
} catch {
    Write-Status "Received interrupt signal"
} finally {
    Stop-AllServices
}