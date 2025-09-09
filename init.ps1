# Developer Onboarding Script for Chinook Music Database Administration Application
# PowerShell version - This script automates the complete setup process for new developers

# Set strict mode for better error handling
Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"  # Changed to Continue to handle non-critical errors

# Global variables
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Errors = @()
$Warnings = @()
$CreatedFiles = @()

# Service configuration
$Services = @{
    "auth" = 3000
    "app" = 3001
    "catalogos" = 3002
}

# Progress reporting functions
function Write-Header {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Blue
    Write-Host "  Chinook Developer Environment Setup" -ForegroundColor Blue
    Write-Host "================================================" -ForegroundColor Blue
    Write-Host ""
}

function Write-Phase {
    param([string]$Message)
    Write-Host ""
    Write-Host "[PHASE] $Message" -ForegroundColor Blue
    Write-Host "----------------------------------------" -ForegroundColor Blue
}

function Write-Step {
    param([string]$Message)
    Write-Host "[STEP] $Message" -ForegroundColor Green
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
    $script:Warnings += $Message
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
    $script:Errors += $Message
}

# Error handling function
function Handle-Error {
    param([string]$ErrorMessage, [string]$Command = "", [bool]$ExitScript = $true)
    
    Write-Error "Script failed: $ErrorMessage"
    if ($Command) {
        Write-Error "Failed command: $Command"
    }
    
    $script:Errors += $ErrorMessage
    
    if ($ExitScript) {
        Write-Host ""
        Write-Host "Setup failed. Please check the errors above and try again." -ForegroundColor Red
        Write-Host "For troubleshooting help, please refer to the project documentation." -ForegroundColor Yellow
        exit 1
    }
}

# Phase 1: Initialization
function Initialize-Setup {
    Write-Phase "Initializing Setup"
    
    Write-Step "Checking prerequisites..."
    
    # Check if npm is installed
    try {
        $null = Get-Command npm -ErrorAction Stop
        Write-Host "  ✓ npm found" -ForegroundColor Green
    }
    catch {
        Handle-Error "npm is not installed. Please install Node.js and npm first."
    }
    
    # Check if we're in the correct directory
    if (-not (Test-Path "package.json")) {
        Handle-Error "package.json not found. Please run this script from the project root directory."
    }
    else {
        Write-Host "  ✓ package.json found" -ForegroundColor Green
    }
    
    # Check for required template files
    if (-not (Test-Path ".env.development.example")) {
        Handle-Error "Required template file .env.development.example not found."
    }
    else {
        Write-Host "  ✓ .env.development.example found" -ForegroundColor Green
    }
    
    if (-not (Test-Path ".env.microservice.example")) {
        Handle-Error "Required template file .env.microservice.example not found."
    }
    else {
        Write-Host "  ✓ .env.microservice.example found" -ForegroundColor Green
    }
    
    Write-Success "Prerequisites check completed"
    
    Write-Host ""
    Write-Host "This script will:"
    Write-Host "  • Install all project dependencies"
    Write-Host "  • Create environment files for all services"
    Write-Host "  • Set up microservices configuration"
    Write-Host "  • Initialize database with migrations and seed data"
    Write-Host "  • Provide you with next steps to start development"
    Write-Host ""
}

# Phase 2: Dependency Installation
function Install-Dependencies {
    Write-Phase "Installing Dependencies"
    
    Write-Step "Installing root-level dependencies..."
    
    try {
        $process = Start-Process -FilePath "npm" -ArgumentList "install" -Wait -PassThru -NoNewWindow
        if ($process.ExitCode -eq 0) {
            Write-Success "Dependencies installed successfully"
        }
        else {
            throw "npm install failed with exit code $($process.ExitCode)"
        }
    }
    catch {
        Handle-Error "Failed to install dependencies. Try running 'npm install --verbose' for more details." "npm install"
    }
}

# Phase 3: Environment File Generation
function New-EnvironmentFiles {
    Write-Phase "Creating Environment Files"
    
    # Create service environment files
    Write-Step "Creating service environment files..."
    
    foreach ($service in $Services.Keys) {
        $serviceDir = $service
        $envFile = Join-Path $serviceDir ".env"
        $port = $Services[$service]
        
        if (Test-Path $envFile) {
            Write-Warning "Environment file already exists for $service service, skipping: $envFile"
            continue
        }
        
        if (-not (Test-Path ".env.development.example")) {
            Write-Error "Template file .env.development.example not found"
            continue
        }
        
        # Create service directory if it doesn't exist
        if (-not (Test-Path $serviceDir)) {
            New-Item -ItemType Directory -Path $serviceDir -Force | Out-Null
        }
        
        try {
            # Read template and replace PORT value
            $templateContent = Get-Content ".env.development.example" -Raw -ErrorAction Stop
            $envContent = $templateContent -replace "PORT=\s*$", "PORT=$port"
            
            # Ensure directory exists
            $envDir = Split-Path $envFile -Parent
            if (-not (Test-Path $envDir)) {
                New-Item -ItemType Directory -Path $envDir -Force | Out-Null
            }
            
            # Write to service .env file with UTF8 encoding (no BOM)
            [System.IO.File]::WriteAllText((Resolve-Path $envFile -ErrorAction SilentlyContinue).Path ?? $envFile, $envContent, [System.Text.UTF8Encoding]::new($false))
            
            Write-Success "Created environment file for $service service (PORT=$port)"
            $script:CreatedFiles += $envFile
        }
        catch [System.UnauthorizedAccessException] {
            Write-Error "Permission denied creating environment file for $service service. Try running PowerShell as Administrator."
        }
        catch {
            Write-Error "Failed to create environment file for $service service: $_"
        }
    }
    
    # Create microservices environment file
    Write-Step "Creating microservices environment file..."
    
    $microservicesEnv = Join-Path "microservices" ".env"
    
    if (Test-Path $microservicesEnv) {
        Write-Warning "Microservices environment file already exists, skipping: $microservicesEnv"
    }
    else {
        if (-not (Test-Path ".env.microservice.example")) {
            Write-Error "Template file .env.microservice.example not found"
        }
        else {
            try {
                # Create microservices directory if it doesn't exist
                $microservicesDir = "microservices"
                if (-not (Test-Path $microservicesDir)) {
                    New-Item -ItemType Directory -Path $microservicesDir -Force | Out-Null
                }
                
                # Create .env file with dummy values
                $microservicesContent = @"
MAIL_HOST=localhost
MAIL_PORT=587
MAIL_USER=dummy@example.com
MAIL_PASSWORD=dummypassword
"@
                
                [System.IO.File]::WriteAllText((Resolve-Path $microservicesEnv -ErrorAction SilentlyContinue).Path ?? $microservicesEnv, $microservicesContent, [System.Text.UTF8Encoding]::new($false))
                
                Write-Success "Created microservices environment file with dummy values"
                $script:CreatedFiles += $microservicesEnv
            }
            catch [System.UnauthorizedAccessException] {
                Write-Error "Permission denied creating microservices environment file. Try running PowerShell as Administrator."
            }
            catch {
                Write-Error "Failed to create microservices environment file: $_"
            }
        }
    }
}

# Phase 4: Database Setup
function Initialize-Database {
    Write-Phase "Setting Up Database"
    
    Write-Step "Running database migrations..."
    
    # Database migration commands
    $migrations = @(
        "database:migrate-app",
        "database:migrate-auth",
        "database:migrate-cat"
    )
    
    $migrationResults = @()
    
    foreach ($migration in $migrations) {
        Write-Step "Executing $migration..."
        
        try {
            $process = Start-Process -FilePath "npm" -ArgumentList "run", $migration -Wait -PassThru -NoNewWindow
            if ($process.ExitCode -eq 0) {
                Write-Success "Migration $migration completed successfully"
                $migrationResults += "$migration: SUCCESS"
            }
            else {
                throw "Migration failed with exit code $($process.ExitCode)"
            }
        }
        catch {
            Write-Error "Migration $migration failed: $_"
            $migrationResults += "$migration: FAILED"
            # Continue with other migrations instead of exiting
        }
    }
    
    # Run database seeding
    Write-Step "Seeding database with initial data..."
    
    try {
        $process = Start-Process -FilePath "npm" -ArgumentList "run", "database:seed" -Wait -PassThru -NoNewWindow
        if ($process.ExitCode -eq 0) {
            Write-Success "Database seeding completed successfully"
            $migrationResults += "database:seed: SUCCESS"
        }
        else {
            throw "Database seeding failed with exit code $($process.ExitCode)"
        }
    }
    catch {
        Write-Error "Database seeding failed: $_"
        $migrationResults += "database:seed: FAILED"
    }
    
    # Display migration summary
    Write-Host ""
    Write-Host "Migration Summary:" -ForegroundColor Blue
    foreach ($result in $migrationResults) {
        if ($result -like "*SUCCESS*") {
            Write-Host "  ✓ $result" -ForegroundColor Green
        }
        else {
            Write-Host "  ✗ $result" -ForegroundColor Red
        }
    }
}

# Phase 5: Completion and Summary
function Complete-Setup {
    Write-Phase "Setup Complete"
    
    # Display summary
    Write-Host ""
    Write-Host "🎉 Developer environment setup completed!" -ForegroundColor Green
    Write-Host ""
    
    if ($script:CreatedFiles.Count -gt 0) {
        Write-Host "Created Files:" -ForegroundColor Blue
        foreach ($file in $script:CreatedFiles) {
            Write-Host "  • $file"
        }
        Write-Host ""
    }
    
    if ($script:Warnings.Count -gt 0) {
        Write-Host "Warnings:" -ForegroundColor Yellow
        foreach ($warning in $script:Warnings) {
            Write-Host "  • $warning"
        }
        Write-Host ""
    }
    
    if ($script:Errors.Count -gt 0) {
        Write-Host "Errors encountered:" -ForegroundColor Red
        foreach ($error in $script:Errors) {
            Write-Host "  • $error"
        }
        Write-Host ""
    }
    
    # Display next steps
    Write-Host "Next Steps:" -ForegroundColor Blue
    Write-Host "  1. Start the development environment:"
    Write-Host "     " -NoNewline
    Write-Host "./run.sh" -ForegroundColor Green
    Write-Host ""
    Write-Host "  2. Or start services individually:"
    Write-Host "     " -NoNewline
    Write-Host "npm run app:dev" -ForegroundColor Green -NoNewline
    Write-Host "     # Start main app service (port 3001)"
    Write-Host "     " -NoNewline
    Write-Host "npm run auth:dev" -ForegroundColor Green -NoNewline
    Write-Host "    # Start auth service (port 3000)"
    Write-Host "     " -NoNewline
    Write-Host "npm run cat:dev" -ForegroundColor Green -NoNewline
    Write-Host "     # Start catalog service (port 3002)"
    Write-Host "     " -NoNewline
    Write-Host "npm run web:dev" -ForegroundColor Green -NoNewline
    Write-Host "     # Start web frontend"
    Write-Host ""
    Write-Host "  3. Access the application:"
    Write-Host "     • Frontend: http://localhost:5173 (or as shown by Vite)"
    Write-Host "     • Auth API: http://localhost:3000"
    Write-Host "     • App API: http://localhost:3001"
    Write-Host "     • Catalog API: http://localhost:3002"
    Write-Host ""
    Write-Host "Happy coding! 🚀" -ForegroundColor Green
}

# Main execution flow
function Main {
    try {
        Write-Header
        
        Initialize-Setup
        Install-Dependencies
        New-EnvironmentFiles
        Initialize-Database
        Complete-Setup
    }
    catch {
        Handle-Error $_.Exception.Message
    }
    finally {
        # Ensure we always show a summary even if there were errors
        if ($script:Errors.Count -gt 0 -or $script:Warnings.Count -gt 0) {
            Write-Host ""
            Write-Host "Script execution completed with issues. See summary above." -ForegroundColor Yellow
        }
    }
}

# Execute main function
Main
