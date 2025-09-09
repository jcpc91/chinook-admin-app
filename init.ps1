# Developer Onboarding Script for Chinook Music Database Administration Application
# PowerShell version - This script automates the complete setup process for new developers

# Set strict mode for better error handling
Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"

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

# Template processing functions
function Read-TemplateFile {
    param([string]$TemplateFile)
    
    if (-not (Test-Path $TemplateFile)) {
        Write-Error "Template file not found: $TemplateFile"
        return $null
    }
    
    try {
        $content = Get-Content $TemplateFile -Raw -ErrorAction Stop
        return $content
    }
    catch {
        Write-Error "Failed to read template file $TemplateFile`: $_"
        return $null
    }
}

function Set-PortValue {
    param([string]$TemplateContent, [int]$Port)
    
    # Replace PORT= with PORT=<port_value>, handling various formats including empty values
    $result = $TemplateContent -replace "PORT=.*", "PORT=$Port"
    return $result
}

function ConvertFrom-MicroserviceTemplate {
    param([string]$TemplateFile)
    
    if (-not (Test-Path $TemplateFile)) {
        Write-Error "Microservice template file not found: $TemplateFile"
        return $null
    }
    
    try {
        # Read template content
        $templateContent = Get-Content $TemplateFile -Raw -ErrorAction Stop
        
        # Substitute each variable with dummy values
        $envContent = $templateContent -replace "MAIL_HOST=.*", "MAIL_HOST=localhost"
        $envContent = $envContent -replace "MAIL_PORT=.*", "MAIL_PORT=587"
        $envContent = $envContent -replace "MAIL_USER=.*", "MAIL_USER=dummy@example.com"
        $envContent = $envContent -replace "MAIL_PASSWORD=.*", "MAIL_PASSWORD=dummypassword"
        
        return $envContent
    }
    catch {
        Write-Error "Failed to process microservice template $TemplateFile`: $_"
        return $null
    }
}

function Test-FileExists {
    param([string]$FilePath, [string]$ServiceName)
    
    if (Test-Path $FilePath) {
        Write-Warning "Environment file already exists for $ServiceName, skipping creation: $FilePath"
        return $true
    }
    
    return $false
}

function New-ServiceEnvironmentFile {
    param([string]$Service, [int]$Port)
    
    $serviceDir = $Service
    $envFile = Join-Path $serviceDir ".env"
    $templateFile = ".env.development.example"
    
    # Check if file already exists
    if (Test-FileExists $envFile "$Service service") {
        return $true
    }
    
    # Read template file
    $templateContent = Read-TemplateFile $templateFile
    if ($null -eq $templateContent) {
        return $false
    }
    
    # Substitute PORT value
    $envContent = Set-PortValue $templateContent $Port
    
    try {
        # Create service directory if it doesn't exist
        if (-not (Test-Path $serviceDir)) {
            New-Item -ItemType Directory -Path $serviceDir -Force | Out-Null
        }
        
        # Write environment file with UTF8 encoding (no BOM)
        $fullPath = if (Test-Path $envFile) { (Resolve-Path $envFile).Path } else { $envFile }
        [System.IO.File]::WriteAllText($fullPath, $envContent, [System.Text.UTF8Encoding]::new($false))
        
        Write-Success "Created environment file for $Service service (PORT=$Port)"
        $script:CreatedFiles += $envFile
        return $true
    }
    catch [System.UnauthorizedAccessException] {
        Write-Error "Permission denied creating environment file for $Service service. Try running PowerShell as Administrator."
        return $false
    }
    catch {
        Write-Error "Failed to create environment file for $Service service: $_"
        return $false
    }
}

function New-MicroservicesEnvironmentFile {
    $microservicesDir = "microservices"
    $envFile = Join-Path $microservicesDir ".env"
    $templateFile = ".env.microservice.example"
    
    # Check if file already exists
    if (Test-FileExists $envFile "microservices") {
        return $true
    }
    
    # Process microservice template
    $envContent = ConvertFrom-MicroserviceTemplate $templateFile
    if ($null -eq $envContent) {
        return $false
    }
    
    try {
        # Create microservices directory if it doesn't exist
        if (-not (Test-Path $microservicesDir)) {
            New-Item -ItemType Directory -Path $microservicesDir -Force | Out-Null
        }
        
        # Write environment file with UTF8 encoding (no BOM)
        $fullPath = if (Test-Path $envFile) { (Resolve-Path $envFile).Path } else { $envFile }
        [System.IO.File]::WriteAllText($fullPath, $envContent, [System.Text.UTF8Encoding]::new($false))
        
        Write-Success "Created microservices environment file with dummy values"
        $script:CreatedFiles += $envFile
        return $true
    }
    catch [System.UnauthorizedAccessException] {
        Write-Error "Permission denied creating microservices environment file. Try running PowerShell as Administrator."
        return $false
    }
    catch {
        Write-Error "Failed to create microservices environment file: $_"
        return $false
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
    
    $serviceCreationErrors = 0
    
    foreach ($service in $Services.Keys) {
        $port = $Services[$service]
        
        if (-not (New-ServiceEnvironmentFile $service $port)) {
            $serviceCreationErrors++
        }
    }
    
    # Create microservices environment file
    Write-Step "Creating microservices environment file..."
    
    if (-not (New-MicroservicesEnvironmentFile)) {
        $serviceCreationErrors++
    }
    
    # Report summary
    if ($serviceCreationErrors -gt 0) {
        Write-Warning "$serviceCreationErrors environment file(s) could not be created"
    }
    
    if ($script:CreatedFiles.Count -gt 0) {
        Write-Success "Environment file creation phase completed"
    }
    else {
        Write-Warning "No new environment files were created (all files already exist or errors occurred)"
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
                $migrationResults += "$migration`: SUCCESS"
            }
            else {
                throw "Migration failed with exit code $($process.ExitCode)"
            }
        }
        catch {
            Write-Error "Migration $migration failed: $_"
            $migrationResults += "$migration`: FAILED"
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
    Write-Host "     run.sh" -ForegroundColor Green
    Write-Host ""
    Write-Host "  2. Or start services individually:"
    Write-Host "     npm run app:dev     # Start main app service (port 3001)" -ForegroundColor Green
    Write-Host "     npm run auth:dev    # Start auth service (port 3000)" -ForegroundColor Green
    Write-Host "     npm run cat:dev     # Start catalog service (port 3002)" -ForegroundColor Green
    Write-Host "     npm run web:dev     # Start web frontend" -ForegroundColor Green
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