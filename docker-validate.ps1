# Docker Configuration Validation Script (PowerShell)
# This script validates the Docker infrastructure setup

Write-Host "Docker Infrastructure Validation" -ForegroundColor Cyan
Write-Host "================================="

# Check if Docker is installed and running
try {
    docker --version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Docker is not installed" -ForegroundColor Red
        exit 1
    }
    
    docker info | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Docker daemon is not running" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "SUCCESS: Docker is installed and running" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Cannot check Docker installation" -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is available
try {
    docker-compose --version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Docker Compose is not installed" -ForegroundColor Red
        exit 1
    }
    Write-Host "SUCCESS: Docker Compose is available" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Cannot check Docker Compose installation" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Validating Docker Compose configurations..." -ForegroundColor Yellow

$composeFiles = @("docker-compose.yml", "docker-compose.dev.yml", "docker-compose.staging.yml", "docker-compose.prod.yml")

foreach ($file in $composeFiles) {
    if (Test-Path $file) {
        Write-Host "SUCCESS: $file exists" -ForegroundColor Green
    } else {
        Write-Host "ERROR: $file is missing" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Checking .dockerignore files..." -ForegroundColor Yellow

$dockerignoreLocations = @(".", "web", "app", "auth", "catalogos", "database")

foreach ($location in $dockerignoreLocations) {
    $dockerignorePath = Join-Path $location ".dockerignore"
    if (Test-Path $dockerignorePath) {
        Write-Host "SUCCESS: $location/.dockerignore exists" -ForegroundColor Green
    } else {
        Write-Host "ERROR: $location/.dockerignore is missing" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Checking environment variable templates..." -ForegroundColor Yellow

$envTemplates = @(".env.development.template", ".env.staging.template", ".env.production.template")

foreach ($template in $envTemplates) {
    if (Test-Path $template) {
        Write-Host "SUCCESS: $template exists" -ForegroundColor Green
    } else {
        Write-Host "ERROR: $template is missing" -ForegroundColor Red
    }
}

$serviceDirs = @("web", "app", "auth", "catalogos", "database")

foreach ($service in $serviceDirs) {
    $templatePath = Join-Path $service ".env.template"
    if (Test-Path $templatePath) {
        Write-Host "SUCCESS: $service/.env.template exists" -ForegroundColor Green
    } else {
        Write-Host "ERROR: $service/.env.template is missing" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Validation complete!" -ForegroundColor Cyan