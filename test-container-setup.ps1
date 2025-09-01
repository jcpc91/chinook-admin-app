# Test script to verify container testing setup
# This script validates that all test configurations are properly set up

Write-Host "🧪 Testing Container Setup Validation" -ForegroundColor Blue
Write-Host "======================================" -ForegroundColor Blue

# Check if Docker is available
Write-Host "Checking Docker availability..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker not found or not running" -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is available
Write-Host "Checking Docker Compose availability..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose found: $composeVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker Compose not found" -ForegroundColor Red
    exit 1
}

# Validate test configuration files exist
Write-Host "Validating test configuration files..." -ForegroundColor Yellow

$testFiles = @(
    "docker-compose.test.yml",
    "web/vitest.config.container.js",
    "app/jest.config.container.js",
    "auth/jest.config.container.js",
    "catalogos/jest.config.container.js",
    "app/tests/setup.container.js",
    "auth/tests/setup.container.js",
    "catalogos/tests/setup.container.js"
)

$missingFiles = @()
foreach ($file in $testFiles) {
    if (Test-Path $file) {
        Write-Host "✅ Found: $file" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Missing: $file" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ Missing test configuration files. Please ensure all files are created." -ForegroundColor Red
    exit 1
}

# Validate Docker Compose test configuration
Write-Host "Validating Docker Compose test configuration..." -ForegroundColor Yellow
try {
    $composeConfig = docker-compose -f docker-compose.test.yml config 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker Compose test configuration is valid" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Docker Compose test configuration has errors:" -ForegroundColor Red
        Write-Host $composeConfig -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "❌ Failed to validate Docker Compose configuration" -ForegroundColor Red
    exit 1
}

# Test building the test environment (without running tests)
Write-Host "Testing test environment build..." -ForegroundColor Yellow
try {
    Write-Host "Building PostgreSQL test database..." -ForegroundColor Cyan
    $buildResult = docker-compose -f docker-compose.test.yml build postgres-test 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL test database builds successfully" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Failed to build PostgreSQL test database:" -ForegroundColor Red
        Write-Host $buildResult -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Error building test environment" -ForegroundColor Red
}

# Clean up any test containers that might have been created
Write-Host "Cleaning up test environment..." -ForegroundColor Yellow
try {
    docker-compose -f docker-compose.test.yml down -v --remove-orphans 2>$null
    Write-Host "✅ Test environment cleaned up" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Warning: Could not clean up test environment" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Container testing setup validation completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Blue
Write-Host "1. Run tests for a specific service: .\docker-test.ps1 -Service auth" -ForegroundColor Cyan
Write-Host "2. Run all tests: .\docker-test.ps1" -ForegroundColor Cyan
Write-Host "3. Run tests with coverage: .\docker-test.ps1 -Coverage -Service app" -ForegroundColor Cyan
Write-Host "4. Debug tests: .\docker-test.ps1 -Debug -Service auth" -ForegroundColor Cyan