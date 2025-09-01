# Validation script for hybrid development environment setup
# This script checks if the development environment was properly initialized

$ErrorActionPreference = "Continue"

Write-Host "🔍 Validating hybrid development environment setup..." -ForegroundColor Green
Write-Host ""

$allChecksPass = $true

# Check if required directories exist
$requiredDirs = @("web", "auth", "app", "catalogos", "database", ".db")
foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "✅ Directory '$dir' exists" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Directory '$dir' missing" -ForegroundColor Red
        $allChecksPass = $false
    }
}

Write-Host ""

# Check if environment files were created
$envFiles = @(
    @{Path = "web/.env.development"; Description = "Web service development environment" },
    @{Path = "auth/.env"; Description = "Auth service environment" },
    @{Path = "app/.env"; Description = "App service environment" },
    @{Path = "catalogos/.env"; Description = "Catalogos service environment" },
    @{Path = ".env"; Description = "Docker Compose environment" }
)

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile.Path) {
        Write-Host "✅ $($envFile.Description): $($envFile.Path)" -ForegroundColor Green
        
        # Check if JWT secret is present
        $content = Get-Content $envFile.Path -Raw
        if ($content -match "JWT_SECREAT_KEY=.+") {
            Write-Host "   └─ JWT secret configured" -ForegroundColor Cyan
        }
        else {
            Write-Host "   └─ ⚠️  JWT secret missing or empty" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "❌ $($envFile.Description): $($envFile.Path) missing" -ForegroundColor Red
        $allChecksPass = $false
    }
}

Write-Host ""

# Check if Docker Compose file exists
if (Test-Path "docker-compose.dev.yml") {
    Write-Host "✅ Docker Compose development configuration exists" -ForegroundColor Green
}
else {
    Write-Host "❌ Docker Compose development configuration missing" -ForegroundColor Red
    $allChecksPass = $false
}

# Check if Docker is available
Write-Host ""
Write-Host "🐳 Checking Docker availability..." -ForegroundColor Green
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "✅ Docker is installed: $dockerVersion" -ForegroundColor Green
        
        try {
            docker info 2>$null | Out-Null
            Write-Host "✅ Docker daemon is running" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Docker daemon is not running" -ForegroundColor Red
            $allChecksPass = $false
        }
    }
    else {
        Write-Host "❌ Docker is not installed" -ForegroundColor Red
        $allChecksPass = $false
    }
}
catch {
    Write-Host "❌ Docker is not available" -ForegroundColor Red
    $allChecksPass = $false
}

# Check if Node.js is available
Write-Host ""
Write-Host "📦 Checking Node.js availability..." -ForegroundColor Green
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Node.js is not installed" -ForegroundColor Red
        $allChecksPass = $false
    }
}
catch {
    Write-Host "❌ Node.js is not available" -ForegroundColor Red
    $allChecksPass = $false
}

# Check if npm packages are installed
Write-Host ""
Write-Host "📚 Checking npm dependencies..." -ForegroundColor Green
$services = @("web", "auth", "app", "catalogos", "database")
foreach ($service in $services) {
    if (Test-Path "$service/node_modules") {
        Write-Host "✅ $service: Dependencies installed" -ForegroundColor Green
    }
    else {
        Write-Host "❌ $service: Dependencies missing" -ForegroundColor Red
        $allChecksPass = $false
    }
}

# Check database files
Write-Host ""
Write-Host "🗄️  Checking database files..." -ForegroundColor Green
$dbFiles = @("app.sqlite3", "auth.sqlite3", "catalogos.sqlite3")
foreach ($dbFile in $dbFiles) {
    if (Test-Path ".db/$dbFile") {
        Write-Host "✅ Database file: .db/$dbFile" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Database file missing: .db/$dbFile" -ForegroundColor Red
        $allChecksPass = $false
    }
}

Write-Host ""
Write-Host "=" * 60
if ($allChecksPass) {
    Write-Host "🎉 All checks passed! Environment is ready for development." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Start containerized web service: docker-compose -f docker-compose.dev.yml up web" -ForegroundColor White
    Write-Host "2. Start local backend services in separate terminals:" -ForegroundColor White
    Write-Host "   - cd auth && npm run dev" -ForegroundColor Yellow
    Write-Host "   - cd app && npm run dev" -ForegroundColor Yellow
    Write-Host "   - cd catalogos && npm run dev" -ForegroundColor Yellow
}
else {
    Write-Host "❌ Some checks failed. Please run docker-init.dev.ps1 to fix issues." -ForegroundColor Red
}
Write-Host "=" * 60