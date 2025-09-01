# Integration Testing Script for Development Environment (PowerShell)
# Tests containerized web frontend with local backend services

param(
    [switch]$SkipCleanup = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🧪 Starting Integration Tests for Development Environment" -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Blue

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

# Cleanup function
function Cleanup {
    if (-not $SkipCleanup) {
        Write-Status "Cleaning up development environment..."
        
        # Stop containerized web service
        try {
            docker-compose -f docker-compose.dev.yml down 2>$null
        } catch {
            # Ignore errors during cleanup
        }
        
        Write-Warning "Local backend services left running for continued development"
        Write-Success "Cleanup completed"
    }
}

# Set trap for cleanup on exit
trap { Cleanup; exit 1 }

try {
    # Step 1: Check prerequisites
    Write-Status "Checking prerequisites..."

    # Check if Docker is running
    try {
        docker info >$null 2>&1
    } catch {
        Write-Error "Docker is not running. Please start Docker and try again."
        exit 1
    }

    # Check if Node.js is available
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Error "Node.js is not installed. Please install Node.js and try again."
        exit 1
    }

    # Check if npm is available
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Error "npm is not installed. Please install npm and try again."
        exit 1
    }

    Write-Success "Prerequisites check passed"

    # Step 2: Initialize local backend services
    Write-Status "Initializing local backend services..."

    # Check if databases are initialized
    if (-not (Test-Path ".db")) {
        Write-Status "Initializing databases..."
        if (Test-Path "init.sh") {
            bash init.sh
        } else {
            Write-Warning "init.sh not found, skipping database initialization"
        }
    } else {
        Write-Status "Databases already initialized"
    }

    # Start local backend services if not running
    Write-Status "Checking local backend services..."

    # Check auth service
    try {
        Invoke-RestMethod -Uri "http://localhost:3000/health" -TimeoutSec 5 >$null
        Write-Success "Auth service already running"
    } catch {
        Write-Status "Starting auth service..."
        Push-Location auth
        npm install >$null 2>&1
        Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden
        Pop-Location
        
        # Wait for auth service to start
        $authReady = $false
        for ($i = 1; $i -le 30; $i++) {
            try {
                Invoke-RestMethod -Uri "http://localhost:3000/health" -TimeoutSec 2 >$null
                $authReady = $true
                break
            } catch {
                Start-Sleep 1
            }
        }
        
        if (-not $authReady) {
            Write-Error "Failed to start auth service"
            exit 1
        }
        Write-Success "Auth service started"
    }

    # Check app service
    try {
        Invoke-RestMethod -Uri "http://localhost:3001/health" -TimeoutSec 5 >$null
        Write-Success "App service already running"
    } catch {
        Write-Status "Starting app service..."
        Push-Location app
        npm install >$null 2>&1
        Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden
        Pop-Location
        
        # Wait for app service to start
        $appReady = $false
        for ($i = 1; $i -le 30; $i++) {
            try {
                Invoke-RestMethod -Uri "http://localhost:3001/health" -TimeoutSec 2 >$null
                $appReady = $true
                break
            } catch {
                Start-Sleep 1
            }
        }
        
        if (-not $appReady) {
            Write-Error "Failed to start app service"
            exit 1
        }
        Write-Success "App service started"
    }

    # Check catalogos service
    try {
        Invoke-RestMethod -Uri "http://localhost:3002/health" -TimeoutSec 5 >$null
        Write-Success "Catalogos service already running"
    } catch {
        Write-Status "Starting catalogos service..."
        Push-Location catalogos
        npm install >$null 2>&1
        Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden
        Pop-Location
        
        # Wait for catalogos service to start
        $catalogosReady = $false
        for ($i = 1; $i -le 30; $i++) {
            try {
                Invoke-RestMethod -Uri "http://localhost:3002/health" -TimeoutSec 2 >$null
                $catalogosReady = $true
                break
            } catch {
                Start-Sleep 1
            }
        }
        
        if (-not $catalogosReady) {
            Write-Error "Failed to start catalogos service"
            exit 1
        }
        Write-Success "Catalogos service started"
    }

    # Step 3: Start containerized web service
    Write-Status "Starting containerized web service..."
    docker-compose -f docker-compose.dev.yml up -d web

    # Wait for web service to be ready
    Write-Status "Waiting for web service to be ready..."
    $webReady = $false
    for ($i = 1; $i -le 60; $i++) {
        try {
            Invoke-RestMethod -Uri "http://localhost:5173/" -TimeoutSec 3 >$null
            $webReady = $true
            break
        } catch {
            Start-Sleep 2
        }
    }

    if (-not $webReady) {
        Write-Error "Web service failed to start"
        exit 1
    }

    Write-Success "Web service is ready"

    # Step 4: Install Playwright dependencies
    Write-Status "Installing Playwright dependencies..."
    Push-Location web
    npm install >$null 2>&1
    npx playwright install >$null 2>&1
    Pop-Location

    # Step 5: Run integration tests
    Write-Status "Running integration tests for development environment..."
    Push-Location web

    # Run development-specific integration tests
    npm run test:e2e:dev
    $testExitCode = $LASTEXITCODE

    Pop-Location

    # Step 6: Report results
    if ($testExitCode -eq 0) {
        Write-Success "All integration tests passed!"
        Write-Host ""
        Write-Host "🎉 Development Environment Integration Tests: PASSED" -ForegroundColor Green
        Write-Host "==================================================" -ForegroundColor Green
        Write-Host "✅ Service Communication: OK" -ForegroundColor Green
        Write-Host "✅ CORS Configuration: OK" -ForegroundColor Green
        Write-Host "✅ Database Connectivity: OK" -ForegroundColor Green
        Write-Host "✅ Complete Workflows: OK" -ForegroundColor Green
        Write-Host "✅ Environment Configuration: OK" -ForegroundColor Green
    } else {
        Write-Error "Some integration tests failed!"
        Write-Host ""
        Write-Host "❌ Development Environment Integration Tests: FAILED" -ForegroundColor Red
        Write-Host "==================================================" -ForegroundColor Red
        Write-Host "Check the test output above for details." -ForegroundColor Red
        exit 1
    }

} finally {
    Cleanup
}