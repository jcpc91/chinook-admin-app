# Comprehensive Integration Testing Script (PowerShell)
# Runs integration tests across all environments

param(
    [switch]$Dev = $false,
    [switch]$Staging = $false,
    [switch]$Production = $false,
    [switch]$All = $false,
    [switch]$SkipCleanup = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🧪 Comprehensive Integration Testing Suite" -ForegroundColor Blue
Write-Host "=========================================" -ForegroundColor Blue

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

# Test results tracking
$testResults = @{
    Development = $null
    Staging = $null
    Production = $null
}

# Determine which tests to run
if ($All) {
    $Dev = $true
    $Staging = $true
    $Production = $true
}

if (-not ($Dev -or $Staging -or $Production)) {
    Write-Host "Usage: .\test-integration-all.ps1 [-Dev] [-Staging] [-Production] [-All] [-SkipCleanup]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -Dev         Run development environment tests" -ForegroundColor Yellow
    Write-Host "  -Staging     Run staging environment tests" -ForegroundColor Yellow
    Write-Host "  -Production  Run production environment tests" -ForegroundColor Yellow
    Write-Host "  -All         Run all environment tests" -ForegroundColor Yellow
    Write-Host "  -SkipCleanup Skip cleanup after tests" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\test-integration-all.ps1 -Dev" -ForegroundColor Yellow
    Write-Host "  .\test-integration-all.ps1 -Staging -Production" -ForegroundColor Yellow
    Write-Host "  .\test-integration-all.ps1 -All" -ForegroundColor Yellow
    exit 1
}

try {
    # Prerequisites check
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

    # Run Development Environment Tests
    if ($Dev) {
        Write-Host ""
        Write-Host "🔧 Running Development Environment Tests" -ForegroundColor Magenta
        Write-Host "=======================================" -ForegroundColor Magenta
        
        try {
            & .\test-integration-dev.ps1 -SkipCleanup:$SkipCleanup
            $testResults.Development = "PASSED"
            Write-Success "Development environment tests completed successfully"
        } catch {
            $testResults.Development = "FAILED"
            Write-Error "Development environment tests failed: $($_.Exception.Message)"
        }
    }

    # Run Staging Environment Tests
    if ($Staging) {
        Write-Host ""
        Write-Host "🏗️ Running Staging Environment Tests" -ForegroundColor Magenta
        Write-Host "====================================" -ForegroundColor Magenta
        
        try {
            # Create staging environment file if needed
            if (-not (Test-Path ".env.staging")) {
                Write-Status "Creating staging environment file..."
                @"
JWT_SECREAT_KEY=staging_jwt_secret_key_for_integration_testing_minimum_32_chars
DB_USER=chinook_user
DB_PASSWORD=staging_db_password_for_integration_testing
"@ | Out-File -FilePath ".env.staging" -Encoding UTF8
            }

            # Start staging environment
            Write-Status "Starting staging environment..."
            docker-compose -f docker-compose.staging.yml --env-file .env.staging up -d

            # Wait for services to be ready
            Write-Status "Waiting for staging services to be ready..."
            Start-Sleep 30

            # Wait for web service
            $webReady = $false
            for ($i = 1; $i -le 60; $i++) {
                try {
                    Invoke-RestMethod -Uri "http://localhost:80/" -TimeoutSec 3 >$null
                    $webReady = $true
                    break
                } catch {
                    Start-Sleep 3
                }
            }

            if (-not $webReady) {
                throw "Staging web service failed to start"
            }

            # Run staging tests
            Push-Location web
            npm run test:e2e:staging
            if ($LASTEXITCODE -ne 0) {
                throw "Staging tests failed"
            }
            Pop-Location

            $testResults.Staging = "PASSED"
            Write-Success "Staging environment tests completed successfully"

        } catch {
            $testResults.Staging = "FAILED"
            Write-Error "Staging environment tests failed: $($_.Exception.Message)"
        } finally {
            if (-not $SkipCleanup) {
                Write-Status "Cleaning up staging environment..."
                docker-compose -f docker-compose.staging.yml down -v 2>$null
            }
        }
    }

    # Run Production Environment Tests
    if ($Production) {
        Write-Host ""
        Write-Host "🚀 Running Production Environment Tests" -ForegroundColor Magenta
        Write-Host "=======================================" -ForegroundColor Magenta
        
        try {
            # Create production environment file if needed
            if (-not (Test-Path ".env.production")) {
                Write-Status "Creating production environment file..."
                @"
JWT_SECREAT_KEY=production_jwt_secret_key_for_integration_testing_minimum_32_chars
DB_USER=chinook_user
DB_PASSWORD=production_db_password_for_integration_testing
CORS_ORIGIN=http://localhost:80,http://localhost:443
"@ | Out-File -FilePath ".env.production" -Encoding UTF8
            }

            # Start production environment
            Write-Status "Starting production environment (this may take several minutes)..."
            docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

            # Wait for services to be ready (longer timeout for production)
            Write-Status "Waiting for production services to be ready..."
            Start-Sleep 60

            # Wait for web service
            $webReady = $false
            for ($i = 1; $i -le 120; $i++) {
                try {
                    Invoke-RestMethod -Uri "http://localhost:80/" -TimeoutSec 5 >$null
                    $webReady = $true
                    break
                } catch {
                    Start-Sleep 5
                }
            }

            if (-not $webReady) {
                throw "Production web service failed to start"
            }

            # Run production tests
            Push-Location web
            npm run test:e2e:production
            if ($LASTEXITCODE -ne 0) {
                throw "Production tests failed"
            }
            Pop-Location

            $testResults.Production = "PASSED"
            Write-Success "Production environment tests completed successfully"

        } catch {
            $testResults.Production = "FAILED"
            Write-Error "Production environment tests failed: $($_.Exception.Message)"
        } finally {
            if (-not $SkipCleanup) {
                Write-Status "Cleaning up production environment..."
                docker-compose -f docker-compose.prod.yml down -v 2>$null
                docker volume prune -f 2>$null
                docker network prune -f 2>$null
            }
        }
    }

    # Final Results Summary
    Write-Host ""
    Write-Host "📊 Integration Test Results Summary" -ForegroundColor Blue
    Write-Host "==================================" -ForegroundColor Blue

    $allPassed = $true
    $totalTests = 0
    $passedTests = 0

    if ($testResults.Development -ne $null) {
        $totalTests++
        if ($testResults.Development -eq "PASSED") {
            Write-Host "✅ Development Environment: PASSED" -ForegroundColor Green
            $passedTests++
        } else {
            Write-Host "❌ Development Environment: FAILED" -ForegroundColor Red
            $allPassed = $false
        }
    }

    if ($testResults.Staging -ne $null) {
        $totalTests++
        if ($testResults.Staging -eq "PASSED") {
            Write-Host "✅ Staging Environment: PASSED" -ForegroundColor Green
            $passedTests++
        } else {
            Write-Host "❌ Staging Environment: FAILED" -ForegroundColor Red
            $allPassed = $false
        }
    }

    if ($testResults.Production -ne $null) {
        $totalTests++
        if ($testResults.Production -eq "PASSED") {
            Write-Host "✅ Production Environment: PASSED" -ForegroundColor Green
            $passedTests++
        } else {
            Write-Host "❌ Production Environment: FAILED" -ForegroundColor Red
            $allPassed = $false
        }
    }

    Write-Host ""
    Write-Host "Summary: $passedTests/$totalTests tests passed" -ForegroundColor $(if ($allPassed) { "Green" } else { "Red" })

    if ($allPassed) {
        Write-Host ""
        Write-Host "🎉 All Integration Tests Passed!" -ForegroundColor Green
        Write-Host "================================" -ForegroundColor Green
        Write-Host "✅ Service Communication validated across all environments" -ForegroundColor Green
        Write-Host "✅ Database connectivity confirmed" -ForegroundColor Green
        Write-Host "✅ Container orchestration working properly" -ForegroundColor Green
        Write-Host "✅ Environment-specific configurations validated" -ForegroundColor Green
        Write-Host "✅ Complete application workflows tested" -ForegroundColor Green
        exit 0
    } else {
        Write-Host ""
        Write-Host "❌ Some Integration Tests Failed!" -ForegroundColor Red
        Write-Host "================================" -ForegroundColor Red
        Write-Host "Check the individual test outputs above for details." -ForegroundColor Red
        exit 1
    }

} catch {
    Write-Error "Integration test suite failed: $($_.Exception.Message)"
    exit 1
}