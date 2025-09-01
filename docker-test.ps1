# Docker Test Script for Chinook Application (PowerShell)
# Runs unit tests for all services in containerized environment with PostgreSQL test database

param(
    [string]$Service = "",
    [switch]$Verbose = $false,
    [switch]$Rebuild = $false,
    [switch]$Help = $false
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Show help
if ($Help) {
    Write-Host "Usage: .\docker-test.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Service SERVICE    Run tests for specific service (auth, app, catalogos, web)"
    Write-Host "  -Verbose           Enable verbose output"
    Write-Host "  -Rebuild           Rebuild containers before running tests"
    Write-Host "  -Help              Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\docker-test.ps1                  # Run all tests"
    Write-Host "  .\docker-test.ps1 -Service auth    # Run only auth service tests"
    Write-Host "  .\docker-test.ps1 -Rebuild         # Rebuild containers and run all tests"
    exit 0
}

Write-Status "Starting containerized unit tests for Chinook application..."

# Function to cleanup containers and volumes
function Cleanup {
    Write-Status "Cleaning up test containers and volumes..."
    try {
        docker-compose -f docker-compose.test.yml down -v --remove-orphans 2>$null
        docker volume prune -f 2>$null
    } catch {
        # Ignore cleanup errors
    }
}

# Cleanup on script exit
trap { Cleanup }

# Set verbose environment variable for containers
if ($Verbose) {
    $env:VERBOSE_TESTS = "true"
    Write-Status "Verbose mode enabled"
}

# Clean up any existing test containers
Cleanup

# Build containers if rebuild flag is set
if ($Rebuild) {
    Write-Status "Rebuilding test containers..."
    docker-compose -f docker-compose.test.yml build --no-cache
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to rebuild containers"
        exit 1
    }
}

# Start PostgreSQL test database and wait for it to be ready
Write-Status "Starting PostgreSQL test database..."
docker-compose -f docker-compose.test.yml up -d postgres-test
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to start PostgreSQL test database"
    exit 1
}

Write-Status "Waiting for PostgreSQL to be ready..."
$timeout = 60
$counter = 0
do {
    if ($counter -ge $timeout) {
        Write-Error "PostgreSQL failed to start within $timeout seconds"
        exit 1
    }
    Start-Sleep -Seconds 1
    $counter++
    $result = docker-compose -f docker-compose.test.yml exec -T postgres-test pg_isready -U test_user -d chinook_test 2>$null
} while ($LASTEXITCODE -ne 0)

Write-Success "PostgreSQL test database is ready"

# Run database migrations (only if needed for backend services)
if ($Service -eq "web") {
    Write-Status "Skipping database migrations for web-only tests"
} else {
    Write-Status "Running database migrations..."
    
    # Run migrations for each service that needs them
    $migrationFailed = $false
    
    if (-not $Service -or $Service -eq "auth") {
        docker-compose -f docker-compose.test.yml up --exit-code-from db-migrate-auth-test db-migrate-auth-test
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Auth database migrations failed"
            $migrationFailed = $true
        }
    }
    
    if (-not $Service -or $Service -eq "app") {
        docker-compose -f docker-compose.test.yml up --exit-code-from db-migrate-app-test db-migrate-app-test
        if ($LASTEXITCODE -ne 0) {
            Write-Error "App database migrations failed"
            $migrationFailed = $true
        }
    }
    
    if (-not $Service -or $Service -eq "catalogos") {
        docker-compose -f docker-compose.test.yml up --exit-code-from db-migrate-catalogos-test db-migrate-catalogos-test
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Catalogos database migrations failed (known issue with schema)"
        }
    }
    
    if ($migrationFailed) {
        Write-Error "Some database migrations failed"
        exit 1
    }
    
    Write-Success "Database migrations completed"
}

# Function to run tests for a specific service
function Run-ServiceTests {
    param([string]$ServiceName)
    
    $serviceName = "$ServiceName-test"
    
    Write-Status "Running tests for $ServiceName service..."
    
    docker-compose -f docker-compose.test.yml up --exit-code-from $serviceName $serviceName
    if ($LASTEXITCODE -eq 0) {
        Write-Success "$ServiceName tests passed"
        return $true
    } else {
        Write-Error "$ServiceName tests failed"
        return $false
    }
}

# Run tests based on service selection
$testResults = @()

if ($Service) {
    # Run tests for specific service
    switch ($Service.ToLower()) {
        { $_ -in @("auth", "app", "catalogos", "web") } {
            if (Run-ServiceTests $Service) {
                $testResults += "$Service`:PASS"
            } else {
                $testResults += "$Service`:FAIL"
            }
        }
        default {
            Write-Error "Invalid service: $Service"
            Write-Error "Valid services: auth, app, catalogos, web"
            exit 1
        }
    }
} else {
    # Run tests for all services
    $services = @("auth", "app", "catalogos", "web")
    
    foreach ($svc in $services) {
        if (Run-ServiceTests $svc) {
            $testResults += "$svc`:PASS"
        } else {
            $testResults += "$svc`:FAIL"
        }
    }
}

# Print test results summary
Write-Host ""
Write-Status "Test Results Summary:"
Write-Host "========================"

$failedTests = 0
foreach ($result in $testResults) {
    $parts = $result -split ":"
    $serviceName = $parts[0]
    $status = $parts[1]
    
    if ($status -eq "PASS") {
        Write-Success "$serviceName`: PASSED"
    } else {
        Write-Error "$serviceName`: FAILED"
        $failedTests++
    }
}

Write-Host ""
if ($failedTests -eq 0) {
    Write-Success "All tests passed! 🎉"
    exit 0
} else {
    Write-Error "$failedTests test suite(s) failed"
    exit 1
}

# Cleanup
Cleanup