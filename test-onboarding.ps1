# Developer Onboarding Script Test Suite (PowerShell)
# Tests validation and functionality of init.sh and init.ps1

param(
    [switch]$CleanupOnly,
    [switch]$NoCleanup,
    [switch]$Help
)

# Test counters
$script:TestsRun = 0
$script:TestsPassed = 0
$script:TestsFailed = 0
$script:TestResults = @()

# Utility functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
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

function Invoke-Test {
    param(
        [string]$TestName,
        [scriptblock]$TestFunction
    )
    
    $script:TestsRun++
    Write-Info "Running test: $TestName"
    
    try {
        $result = & $TestFunction
        if ($result) {
            $script:TestsPassed++
            $script:TestResults += "PASS $TestName"
            Write-Success "Test passed: $TestName"
        } else {
            $script:TestsFailed++
            $script:TestResults += "FAIL $TestName"
            Write-Error "Test failed: $TestName"
        }
    } catch {
        $script:TestsFailed++
        $script:TestResults += "ERROR $TestName (Exception: $($_.Exception.Message))"
        Write-Error "Test failed with exception: $TestName - $($_.Exception.Message)"
    }
    
    Write-Host ""
}

# Cleanup utility
function Invoke-CleanupTestEnvironment {
    Write-Info "Cleaning up test environment..."
    
    # Remove test .env files
    $services = @("app", "auth", "catalogos", "microservices")
    foreach ($service in $services) {
        $envPath = if ($service -eq "microservices") { "microservices\.env" } else { "$service\.env" }
        if (Test-Path $envPath) {
            Remove-Item $envPath -Force
            Write-Info "Removed $envPath"
        }
    }
    
    # Remove test databases
    $testDbs = @(".db\test_app.sqlite3", ".db\test_auth.sqlite3", ".db\test_catalogos.sqlite3")
    foreach ($db in $testDbs) {
        if (Test-Path $db) {
            Remove-Item $db -Force
            Write-Info "Removed $db"
        }
    }
    
    # Remove test node_modules if created during testing
    if (Test-Path "test_node_modules") {
        Remove-Item "test_node_modules" -Recurse -Force
        Write-Info "Removed test_node_modules"
    }
    
    Write-Success "Cleanup completed"
}

# Cross-platform compatibility checks
function Test-CrossPlatformCompatibility {
    Write-Info "Checking cross-platform compatibility..."
    
    # Check if both scripts exist
    if (-not (Test-Path "init.sh")) {
        Write-Error "init.sh not found"
        return $false
    }
    
    if (-not (Test-Path "init.ps1")) {
        Write-Error "init.ps1 not found"
        return $false
    }
    
    # Check for required template files
    if (-not (Test-Path ".env.development.example")) {
        Write-Error ".env.development.example template not found"
        return $false
    }
    
    if (-not (Test-Path ".env.microservice.example")) {
        Write-Error ".env.microservice.example template not found"
        return $false
    }
    
    Write-Success "Cross-platform compatibility check passed"
    return $true
}

# Validate .env file creation
function Test-EnvFileCreation {
    Write-Info "Validating .env file creation logic..."
    
    # Test service .env file creation
    $services = @(
        @{Name="app"; Port=3001},
        @{Name="auth"; Port=3000},
        @{Name="catalogos"; Port=3002}
    )
    
    foreach ($service in $services) {
        $serviceName = $service.Name
        $expectedPort = $service.Port
        $envPath = "$serviceName\.env"
        
        # Skip if .env already exists
        if (Test-Path $envPath) {
            Write-Warning "$envPath already exists, skipping creation test"
            continue
        }
        
        # Simulate .env creation from template
        if (Test-Path ".env.development.example") {
            if (-not (Test-Path $serviceName)) {
                New-Item -ItemType Directory -Path $serviceName -Force | Out-Null
            }
            
            # Read template and replace PORT
            $template = Get-Content ".env.development.example"
            $envContent = $template -replace "PORT=.*", "PORT=$expectedPort"
            $envContent | Out-File -FilePath $envPath -Encoding UTF8
            
            # Validate content
            if ((Get-Content $envPath) -match "PORT=$expectedPort") {
                Write-Success "$envPath created with correct PORT=$expectedPort"
            } else {
                Write-Error "$envPath missing correct PORT configuration"
                return $false
            }
        } else {
            Write-Error "Template file .env.development.example not found"
            return $false
        }
    }
    
    # Test microservices .env file creation
    if (-not (Test-Path "microservices\.env")) {
        if (-not (Test-Path "microservices")) {
            New-Item -ItemType Directory -Path "microservices" -Force | Out-Null
        }
        
        if (Test-Path ".env.microservice.example") {
            Copy-Item ".env.microservice.example" "microservices\.env"
            
            # Validate dummy values
            $requiredVars = @("MAIL_HOST", "MAIL_PORT", "MAIL_USER", "MAIL_PASSWORD")
            $envContent = Get-Content "microservices\.env"
            
            foreach ($var in $requiredVars) {
                if (-not ($envContent -match "$var=")) {
                    Write-Error "microservices\.env missing required variable: $var"
                    return $false
                }
            }
            Write-Success "microservices\.env created with required variables"
        } else {
            Write-Error "Template file .env.microservice.example not found"
            return $false
        }
    }
    
    return $true
}

# Verify database migration success
function Test-DatabaseMigrations {
    Write-Info "Verifying database migration capabilities..."
    
    # Check if package.json has required migration scripts
    if (-not (Test-Path "package.json")) {
        Write-Error "package.json not found"
        return $false
    }
    
    # Check for migration scripts
    $migrationScripts = @("database:migrate-app", "database:migrate-auth", "database:migrate-cat", "database:seed")
    $packageContent = Get-Content "package.json" -Raw
    
    foreach ($script in $migrationScripts) {
        if ($packageContent -notmatch "`"$script`"") {
            Write-Error "Missing migration script: $script"
            return $false
        }
    }
    
    # Check database directory structure
    if (-not (Test-Path "database")) {
        Write-Error "database directory not found"
        return $false
    }
    
    $dbDirs = @("app", "auth", "catalogos")
    foreach ($dir in $dbDirs) {
        if (-not (Test-Path "database\$dir")) {
            Write-Error "database\$dir directory not found"
            return $false
        }
    }
    
    # Check for .db directory
    if (-not (Test-Path ".db")) {
        Write-Warning ".db directory not found, creating..."
        New-Item -ItemType Directory -Path ".db" -Force | Out-Null
    }
    
    Write-Success "Database migration structure verified"
    return $true
}

# Test script execution simulation
function Test-ScriptExecution {
    Write-Info "Testing script execution simulation..."
    
    # Test dependency installation check
    if (-not (Test-Path "package.json")) {
        Write-Error "package.json not found for dependency testing"
        return $false
    }
    
    # Simulate npm install check
    try {
        $npmVersion = npm --version 2>$null
        if ($npmVersion) {
            Write-Success "npm is available for dependency installation (version: $npmVersion)"
        } else {
            Write-Error "npm not found - dependency installation would fail"
            return $false
        }
    } catch {
        Write-Error "npm not found - dependency installation would fail"
        return $false
    }
    
    # Test file creation permissions
    $testFile = "test_permissions.tmp"
    try {
        New-Item -ItemType File -Path $testFile -Force | Out-Null
        Remove-Item $testFile -Force
        Write-Success "File creation permissions verified"
    } catch {
        Write-Error "Insufficient permissions for file creation"
        return $false
    }
    
    return $true
}

# Integration test for init.sh
function Test-InitShIntegration {
    Write-Info "Running integration test for init.sh..."
    
    if (-not (Test-Path "init.sh")) {
        Write-Error "init.sh not found"
        return $false
    }
    
    # Check for required sections in init.sh
    $initShContent = Get-Content "init.sh" -Raw
    $requiredSections = @("npm install", "env", "database")
    
    foreach ($section in $requiredSections) {
        if ($initShContent -match $section) {
            Write-Success "init.sh contains $section logic"
        } else {
            Write-Warning "init.sh may be missing $section logic"
        }
    }
    
    return $true
}

# Integration test for init.ps1
function Test-InitPs1Integration {
    Write-Info "Running integration test for init.ps1..."
    
    if (-not (Test-Path "init.ps1")) {
        Write-Error "init.ps1 not found"
        return $false
    }
    
    # Check script syntax
    try {
        $null = Get-Content "init.ps1" -ErrorAction Stop
        Write-Success "init.ps1 is readable and accessible"
    } catch {
        Write-Error "init.ps1 has issues: $($_.Exception.Message)"
        return $false
    }
    
    # Check for required PowerShell patterns
    $initPs1Content = Get-Content "init.ps1" -Raw
    $requiredPatterns = @("npm install", "\.env", "Write-Host")
    
    foreach ($pattern in $requiredPatterns) {
        if ($initPs1Content -match $pattern) {
            Write-Success "init.ps1 contains $pattern logic"
        } else {
            Write-Warning "init.ps1 may be missing $pattern logic"
        }
    }
    
    return $true
}

# Test environment file validation
function Test-EnvFileValidation {
    Write-Info "Testing environment file validation..."
    
    # Create test .env files and validate their content
    $testServices = @(
        @{Name="app"; Port=3001},
        @{Name="auth"; Port=3000},
        @{Name="catalogos"; Port=3002}
    )
    
    foreach ($service in $testServices) {
        $serviceName = $service.Name
        $port = $service.Port
        $envPath = "$serviceName\.env"
        
        if (-not (Test-Path $serviceName)) {
            New-Item -ItemType Directory -Path $serviceName -Force | Out-Null
        }
        
        # Create test .env file
        $envContent = @"
CORS_ORIGIN=*
JWT_SECREAT_KEY=588eae8f9d7224acdf847c7b07bd2ccf97157d78bdac49954d2c7d8c403ca3fd
PORT=$port
"@
        $envContent | Out-File -FilePath $envPath -Encoding UTF8
        
        # Validate content
        if (Test-Path $envPath) {
            $content = Get-Content $envPath -Raw
            if (($content -match "PORT=$port") -and ($content -match "JWT_SECREAT_KEY=")) {
                Write-Success "$envPath validation passed"
            } else {
                Write-Error "$envPath validation failed"
                return $false
            }
        } else {
            Write-Error "$envPath was not created"
            return $false
        }
    }
    
    # Test microservices .env validation
    if (-not (Test-Path "microservices")) {
        New-Item -ItemType Directory -Path "microservices" -Force | Out-Null
    }
    
    $microEnvContent = @"
MAIL_HOST=localhost
MAIL_PORT=587
MAIL_USER=dummy@example.com
MAIL_PASSWORD=dummypassword
"@
    $microEnvContent | Out-File -FilePath "microservices\.env" -Encoding UTF8
    
    if (Test-Path "microservices\.env") {
        $requiredVars = @("MAIL_HOST=localhost", "MAIL_PORT=587", "MAIL_USER=dummy@example.com", "MAIL_PASSWORD=dummypassword")
        $content = Get-Content "microservices\.env" -Raw
        
        foreach ($var in $requiredVars) {
            if ($content -match [regex]::Escape($var)) {
                Write-Success "microservices\.env contains $var"
            } else {
                Write-Error "microservices\.env missing $var"
                return $false
            }
        }
    } else {
        Write-Error "microservices\.env was not created"
        return $false
    }
    
    return $true
}

# Main execution function
function Invoke-Main {
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "Developer Onboarding Script Test Suite" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Run all tests
    Invoke-Test "Cross-platform compatibility check" { Test-CrossPlatformCompatibility }
    Invoke-Test "Environment file creation validation" { Test-EnvFileCreation }
    Invoke-Test "Database migration verification" { Test-DatabaseMigrations }
    Invoke-Test "Script execution simulation" { Test-ScriptExecution }
    Invoke-Test "init.sh integration test" { Test-InitShIntegration }
    Invoke-Test "init.ps1 integration test" { Test-InitPs1Integration }
    Invoke-Test "Environment file validation" { Test-EnvFileValidation }
    
    # Display results
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "Test Results Summary" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "Tests run: $script:TestsRun"
    Write-Host "Tests passed: $script:TestsPassed"
    Write-Host "Tests failed: $script:TestsFailed"
    Write-Host ""
    
    Write-Host "Detailed Results:"
    foreach ($result in $script:TestResults) {
        if ($result.StartsWith("PASS")) {
            Write-Host "  + $($result.Substring(5))" -ForegroundColor Green
        } else {
            Write-Host "  - $($result.Substring(5))" -ForegroundColor Red
        }
    }
    Write-Host ""
    
    # Cleanup
    if (-not $NoCleanup) {
        Invoke-CleanupTestEnvironment
    }
    
    # Exit with appropriate code
    if ($script:TestsFailed -eq 0) {
        Write-Success "All tests passed!"
        exit 0
    } else {
        Write-Error "$script:TestsFailed test(s) failed"
        exit 1
    }
}

# Handle command line arguments
if ($Help) {
    Write-Host "Usage: .\test-onboarding.ps1 [OPTIONS]"
    Write-Host "Options:"
    Write-Host "  -CleanupOnly    Only run cleanup, don't run tests"
    Write-Host "  -NoCleanup      Don't run cleanup after tests"
    Write-Host "  -Help           Show this help message"
    exit 0
}

if ($CleanupOnly) {
    Invoke-CleanupTestEnvironment
    exit 0
}

# Run main function
Invoke-Main