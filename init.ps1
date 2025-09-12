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
    param([string]$Message, [int]$PhaseNumber = 0)
    $totalPhases = 5
    Write-Host ""
    if ($PhaseNumber -gt 0) {
        Write-Host "[PHASE $PhaseNumber/$totalPhases] $Message" -ForegroundColor Blue
    } else {
        Write-Host "[PHASE] $Message" -ForegroundColor Blue
    }
    Write-Host "----------------------------------------" -ForegroundColor Blue
}

function Write-Step {
    param([string]$Message)
    Write-Host "[STEP] $Message" -ForegroundColor Green
}

function Write-SubStep {
    param([string]$Message)
    Write-Host "  → $Message" -ForegroundColor Green
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

function Write-Troubleshooting {
    param([string]$Message)
    Write-Host "[TROUBLESHOOTING] $Message" -ForegroundColor Yellow
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
        
        # Provide specific troubleshooting guidance
        Write-Host ""
        Write-Host "Troubleshooting Tips:" -ForegroundColor Yellow
        Write-Host "  • Check if you have proper file permissions in this directory"
        Write-Host "  • Ensure you're running the script from the project root directory"
        Write-Host "  • Verify that npm and Node.js are properly installed"
        Write-Host "  • Try running individual commands manually to identify the issue"
        Write-Host "  • Check if any antivirus software is blocking file operations"
        Write-Host "  • Try running PowerShell as Administrator"
        Write-Host "  • Ensure Windows execution policy allows script execution:"
        Write-Host "    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Green
        
        exit 1
    }
}

# Platform-specific error handling for Windows
function Handle-PermissionError {
    param([string]$FilePath, [string]$Operation)
    
    Write-Error "Permission denied while trying to $Operation`: $FilePath"
    Write-Troubleshooting "File permission issue detected"
    
    Write-Host "  • Try running PowerShell as Administrator" -ForegroundColor Green
    Write-Host "  • Check if the directory is read-only in Windows Explorer"
    Write-Host "  • Disable any antivirus real-time protection temporarily"
    Write-Host "  • Verify Windows execution policy: Get-ExecutionPolicy" -ForegroundColor Green
    Write-Host "  • Check file/folder properties for security restrictions"
    Write-Host "  • Ensure you have write access to: $(Split-Path $FilePath -Parent)" -ForegroundColor Green
}

# Network/dependency error handling
function Handle-DependencyError {
    param([string]$ErrorType)
    
    Write-Error "Dependency installation failed: $ErrorType"
    Write-Troubleshooting "Dependency installation issue detected"
    
    Write-Host "  • Check your internet connection"
    Write-Host "  • Try clearing npm cache: npm cache clean --force" -ForegroundColor Green
    Write-Host "  • Try using a different npm registry: npm install --registry https://registry.npmjs.org/" -ForegroundColor Green
    Write-Host "  • Check if you're behind a corporate firewall or proxy"
    Write-Host "  • Verify Node.js version compatibility: node --version" -ForegroundColor Green
    Write-Host "  • Try deleting node_modules and package-lock.json, then retry"
    Write-Host "  • Run with verbose logging: npm install --verbose" -ForegroundColor Green
    Write-Host "  • Check Windows Defender or antivirus interference"
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
    
    Write-SubStep "Processing $Service service (PORT=$Port)..."
    
    # Check if file already exists
    if (Test-FileExists $envFile "$Service service") {
        return $true
    }
    
    # Read template file
    $templateContent = Read-TemplateFile $templateFile
    if ($null -eq $templateContent) {
        Write-Error "Failed to read template file for $Service service"
        Write-Troubleshooting "Template file issue"
        Write-Host "  • Verify $templateFile exists and is readable"
        Write-Host "  • Check file permissions: Get-Acl $templateFile" -ForegroundColor Green
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
        Write-Host "    ✓ File: $envFile" -ForegroundColor Green
        return $true
    }
    catch [System.UnauthorizedAccessException] {
        Handle-PermissionError $envFile "create file"
        return $false
    }
    catch [System.IO.DirectoryNotFoundException] {
        Write-Error "Directory path not found: $serviceDir"
        Write-Troubleshooting "Directory creation failed"
        Write-Host "  • Check if parent directory exists and is accessible"
        Write-Host "  • Verify path length is not too long for Windows"
        return $false
    }
    catch {
        Write-Error "Failed to create environment file for $Service service: $_"
        Write-Troubleshooting "File creation failed"
        Write-Host "  • Check available disk space: Get-WmiObject -Class Win32_LogicalDisk" -ForegroundColor Green
        Write-Host "  • Verify directory exists: Test-Path $(Split-Path $envFile -Parent)" -ForegroundColor Green
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
    Write-Phase "Initializing Setup" 1
    
    Write-Step "Checking prerequisites..."
    
    # Check if npm is installed
    Write-SubStep "Verifying npm installation..."
    try {
        $npmVersion = npm --version 2>$null
        Write-Host "    ✓ npm found (version: $npmVersion)" -ForegroundColor Green
    }
    catch {
        Write-Troubleshooting "npm not found in PATH"
        Write-Host "  • Download Node.js from: https://nodejs.org/" -ForegroundColor Green
        Write-Host "  • Or use a package manager:"
        Write-Host "    - Chocolatey: choco install nodejs" -ForegroundColor Green
        Write-Host "    - Winget: winget install OpenJS.NodeJS" -ForegroundColor Green
        Write-Host "    - Scoop: scoop install nodejs" -ForegroundColor Green
        Handle-Error "npm is not installed. Please install Node.js and npm first."
    }
    
    # Check Node.js version
    Write-SubStep "Checking Node.js version..."
    try {
        $nodeVersion = node --version 2>$null
        Write-Host "    ✓ Node.js version: $nodeVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "    ⚠ Node.js version check failed" -ForegroundColor Yellow
    }
    
    # Check if we're in the correct directory
    Write-SubStep "Verifying project structure..."
    if (-not (Test-Path "package.json")) {
        Write-Troubleshooting "Incorrect working directory"
        Write-Host "  • Current directory: $(Get-Location)" -ForegroundColor Green
        Write-Host "  • Navigate to the project root where package.json is located"
        Write-Host "  • Use: cd C:\path\to\chinook-project" -ForegroundColor Green
        Handle-Error "package.json not found. Please run this script from the project root directory."
    }
    Write-Host "    ✓ package.json found" -ForegroundColor Green
    
    # Check for required template files
    Write-SubStep "Checking required template files..."
    $missingFiles = @()
    
    if (-not (Test-Path ".env.development.example")) {
        $missingFiles += ".env.development.example"
    } else {
        Write-Host "    ✓ .env.development.example found" -ForegroundColor Green
    }
    
    if (-not (Test-Path ".env.microservice.example")) {
        $missingFiles += ".env.microservice.example"
    } else {
        Write-Host "    ✓ .env.microservice.example found" -ForegroundColor Green
    }
    
    if ($missingFiles.Count -gt 0) {
        Write-Error "Required template files are missing:"
        foreach ($file in $missingFiles) {
            Write-Host "  • $file" -ForegroundColor Red
        }
        Write-Troubleshooting "Missing template files"
        Write-Host "  • Ensure you have cloned the complete repository"
        Write-Host "  • Check if files were excluded by .gitignore"
        Write-Host "  • Verify the repository integrity"
        Handle-Error "Required template files not found."
    }
    
    # Check write permissions
    Write-SubStep "Checking write permissions..."
    try {
        $testFile = ".permission_test"
        "test" | Out-File -FilePath $testFile -ErrorAction Stop
        Remove-Item $testFile -ErrorAction SilentlyContinue
        Write-Host "    ✓ Write permissions confirmed" -ForegroundColor Green
    }
    catch [System.UnauthorizedAccessException] {
        Handle-PermissionError (Get-Location).Path "write to directory"
        Handle-Error "Insufficient permissions to write files in current directory."
    }
    catch {
        Write-Warning "Could not verify write permissions: $_"
    }
    
    Write-Success "Prerequisites check completed successfully"
    
    Write-Host ""
    Write-Host "Setup Overview:" -ForegroundColor Blue
    Write-Host "This script will perform the following operations:"
    Write-Host "  1. Install all project dependencies (~2-5 minutes)" -ForegroundColor Green
    Write-Host "  2. Create environment files for all services" -ForegroundColor Green
    Write-Host "  3. Set up microservices configuration" -ForegroundColor Green
    Write-Host "  4. Initialize database with migrations and seed data" -ForegroundColor Green
    Write-Host "  5. Provide you with next steps to start development" -ForegroundColor Green
    Write-Host ""
    Write-Host "Estimated total time: 3-7 minutes" -ForegroundColor Yellow
    Write-Host ""
}

# Phase 2: Dependency Installation
function Install-Dependencies {
    Write-Phase "Installing Dependencies" 2
    
    Write-Step "Installing root-level dependencies..."
    Write-SubStep "This may take a few minutes depending on your internet connection..."
    
    # Show progress indicator
    Write-Host "  Running npm install..." -ForegroundColor Blue
    
    try {
        # Capture both stdout and stderr
        $processInfo = New-Object System.Diagnostics.ProcessStartInfo
        $processInfo.FileName = "npm"
        $processInfo.Arguments = "install"
        $processInfo.RedirectStandardOutput = $true
        $processInfo.RedirectStandardError = $true
        $processInfo.UseShellExecute = $false
        $processInfo.CreateNoWindow = $true
        
        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $processInfo
        $process.Start() | Out-Null
        
        $stdout = $process.StandardOutput.ReadToEnd()
        $stderr = $process.StandardError.ReadToEnd()
        $process.WaitForExit()
        
        $npmOutput = $stdout + $stderr
        $exitCode = $process.ExitCode
        
        if ($exitCode -eq 0) {
            Write-Success "Dependencies installed successfully"
            
            # Show summary of installed packages
            if ($npmOutput -match "added|updated|removed") {
                Write-Host "  → Package operations completed" -ForegroundColor Green
            }
            
            # Check for any warnings
            if ($npmOutput -match "WARN") {
                Write-Warning "npm install completed with warnings (this is usually normal)"
                Write-Host "  → Check npm output above for details" -ForegroundColor Yellow
            }
        }
        else {
            throw "npm install failed with exit code $exitCode"
        }
    }
    catch {
        Write-Error "Failed to install dependencies (exit code: $exitCode)"
        
        # Analyze the error and provide specific guidance
        if ($npmOutput -match "EACCES|permission denied|UnauthorizedAccessException") {
            Handle-PermissionError "node_modules" "install dependencies"
        }
        elseif ($npmOutput -match "ENOTFOUND|network|timeout|getaddrinfo") {
            Handle-DependencyError "network"
        }
        elseif ($npmOutput -match "ENOSPC|insufficient space") {
            Write-Troubleshooting "Insufficient disk space"
            Write-Host "  • Free up disk space and try again"
            Write-Host "  • Check available space: Get-WmiObject -Class Win32_LogicalDisk" -ForegroundColor Green
        }
        else {
            Handle-DependencyError "unknown"
        }
        
        # Show the actual npm error output
        Write-Host ""
        Write-Host "npm output:" -ForegroundColor Red
        $npmOutput.Split("`n") | Select-Object -Last 20 | ForEach-Object { Write-Host $_ }
        
        Handle-Error "Dependency installation failed" "npm install"
    }
}

# Phase 3: Environment File Generation
function New-EnvironmentFiles {
    Write-Phase "Creating Environment Files" 3
    
    # Create service environment files
    Write-Step "Creating service environment files..."
    
    $serviceCreationErrors = 0
    $servicesProcessed = 0
    $servicesCreated = 0
    $servicesSkipped = 0
    
    foreach ($service in $Services.Keys) {
        $port = $Services[$service]
        $servicesProcessed++
        
        if (New-ServiceEnvironmentFile $service $port) {
            $envFile = Join-Path $service ".env"
            if ((-not (Test-Path $envFile)) -or ($script:CreatedFiles -contains $envFile)) {
                $servicesCreated++
            } else {
                $servicesSkipped++
            }
        } else {
            $serviceCreationErrors++
        }
    }
    
    # Create microservices environment file
    Write-Step "Creating microservices environment file..."
    Write-SubStep "Setting up microservices with dummy mail configuration..."
    
    if (New-MicroservicesEnvironmentFile) {
        $microEnvFile = "microservices\.env"
        if ($script:CreatedFiles -contains $microEnvFile) {
            $servicesCreated++
        } else {
            $servicesSkipped++
        }
    } else {
        $serviceCreationErrors++
    }
    
    # Report detailed summary
    Write-Host ""
    Write-Host "Environment File Summary:" -ForegroundColor Blue
    Write-Host "  • Services processed: $servicesProcessed"
    Write-Host "  • Files created: $servicesCreated"
    Write-Host "  • Files skipped (already exist): $servicesSkipped"
    Write-Host "  • Errors encountered: $serviceCreationErrors"
    
    if ($serviceCreationErrors -gt 0) {
        Write-Warning "$serviceCreationErrors environment file(s) could not be created"
        Write-Troubleshooting "Some environment files failed to create"
        Write-Host "  • You may need to create these files manually"
        Write-Host "  • Check the error messages above for specific guidance"
        Write-Host "  • The setup can continue, but affected services may not start properly"
    }
    
    if ($script:CreatedFiles.Count -gt 0) {
        Write-Success "Environment file creation phase completed"
        Write-Host "  → Created $($script:CreatedFiles.Count) new environment file(s)" -ForegroundColor Green
    } else {
        if ($servicesSkipped -gt 0) {
            Write-Success "Environment file phase completed (all files already existed)"
        } else {
            Write-Warning "No new environment files were created due to errors"
        }
    }
}

# Phase 4: Database Setup
function Initialize-Database {
    Write-Phase "Setting Up Database" 4
    
    Write-Step "Initializing database schema and data..."
    Write-SubStep "This will create SQLite databases and populate them with initial data..."
    
    # Database migration commands
    $migrations = @(
        "database:migrate-app",
        "database:migrate-auth",
        "database:migrate-cat"
    )
    
    $migrationResults = @()
    $successfulMigrations = 0
    $failedMigrations = 0
    
    # Check if database directory exists
    if (-not (Test-Path "database")) {
        Write-Error "Database directory not found"
        Write-Troubleshooting "Missing database directory"
        Write-Host "  • Ensure you have cloned the complete repository"
        Write-Host "  • Check if 'database' directory exists in project root"
        return
    }
    
    foreach ($migration in $migrations) {
        Write-SubStep "Executing $migration..."
        
        try {
            # Capture migration output for better error reporting
            $processInfo = New-Object System.Diagnostics.ProcessStartInfo
            $processInfo.FileName = "npm"
            $processInfo.Arguments = "run $migration"
            $processInfo.RedirectStandardOutput = $true
            $processInfo.RedirectStandardError = $true
            $processInfo.UseShellExecute = $false
            $processInfo.CreateNoWindow = $true
            
            $process = New-Object System.Diagnostics.Process
            $process.StartInfo = $processInfo
            $process.Start() | Out-Null
            
            $stdout = $process.StandardOutput.ReadToEnd()
            $stderr = $process.StandardError.ReadToEnd()
            $process.WaitForExit()
            
            $migrationOutput = $stdout + $stderr
            $exitCode = $process.ExitCode
            
            if ($exitCode -eq 0) {
                Write-Success "Migration $migration completed successfully"
                $migrationResults += "$migration`: SUCCESS"
                $successfulMigrations++
                Write-Host "    ✓ Database schema updated" -ForegroundColor Green
            }
            else {
                throw "Migration failed with exit code $exitCode"
            }
        }
        catch {
            Write-Error "Migration $migration failed (exit code: $exitCode)"
            $migrationResults += "$migration`: FAILED"
            $failedMigrations++
            
            # Provide specific troubleshooting for database issues
            if ($migrationOutput -match "ENOENT|not found") {
                Write-Troubleshooting "Migration script not found"
                Write-Host "  • Check if package.json contains the script: npm run" -ForegroundColor Green
                Write-Host "  • Verify database directory structure"
            }
            elseif ($migrationOutput -match "SQLITE_|database") {
                Write-Troubleshooting "Database error detected"
                Write-Host "  • Check if .db directory exists and is writable"
                Write-Host "  • Verify SQLite is available (usually bundled with Node.js)"
                Write-Host "  • Check database file permissions"
            }
            else {
                Write-Troubleshooting "Migration execution failed"
                Write-Host "  • Check the migration output above for details"
                Write-Host "  • Verify all dependencies are installed"
            }
            
            # Show last few lines of error output
            Write-Host "    Error details:" -ForegroundColor Red
            $migrationOutput.Split("`n") | Select-Object -Last 5 | ForEach-Object { 
                if ($_.Trim()) { Write-Host "    $_" }
            }
            
            # Continue with other migrations instead of exiting
            Write-Warning "Continuing with remaining migrations..."
        }
    }
    
    # Run database seeding
    Write-Step "Seeding database with initial data..."
    Write-SubStep "Populating databases with sample data..."
    
    try {
        $processInfo = New-Object System.Diagnostics.ProcessStartInfo
        $processInfo.FileName = "npm"
        $processInfo.Arguments = "run database:seed"
        $processInfo.RedirectStandardOutput = $true
        $processInfo.RedirectStandardError = $true
        $processInfo.UseShellExecute = $false
        $processInfo.CreateNoWindow = $true
        
        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $processInfo
        $process.Start() | Out-Null
        
        $stdout = $process.StandardOutput.ReadToEnd()
        $stderr = $process.StandardError.ReadToEnd()
        $process.WaitForExit()
        
        $seedOutput = $stdout + $stderr
        $exitCode = $process.ExitCode
        
        if ($exitCode -eq 0) {
            Write-Success "Database seeding completed successfully"
            $migrationResults += "database:seed: SUCCESS"
            Write-Host "    ✓ Sample data loaded" -ForegroundColor Green
        }
        else {
            throw "Database seeding failed with exit code $exitCode"
        }
    }
    catch {
        Write-Error "Database seeding failed (exit code: $exitCode)"
        $migrationResults += "database:seed: FAILED"
        
        Write-Troubleshooting "Database seeding failed"
        Write-Host "  • This is often non-critical - the application may still work"
        Write-Host "  • Check if migrations completed successfully first"
        Write-Host "  • You can manually run: npm run database:seed" -ForegroundColor Green
        Write-Host "  • Or populate data through the application interface"
        
        # Show error details
        Write-Host "    Seed error details:" -ForegroundColor Red
        $seedOutput.Split("`n") | Select-Object -Last 5 | ForEach-Object { 
            if ($_.Trim()) { Write-Host "    $_" }
        }
    }
    
    # Display comprehensive migration summary
    Write-Host ""
    Write-Host "Database Setup Summary:" -ForegroundColor Blue
    Write-Host "  • Successful migrations: $successfulMigrations"
    Write-Host "  • Failed migrations: $failedMigrations"
    Write-Host "  • Total operations: $($migrations.Count + 1)"
    
    Write-Host ""
    Write-Host "Detailed Results:" -ForegroundColor Blue
    foreach ($result in $migrationResults) {
        if ($result -like "*SUCCESS*") {
            Write-Host "  ✓ $result" -ForegroundColor Green
        }
        else {
            Write-Host "  ✗ $result" -ForegroundColor Red
        }
    }
    
    # Provide guidance based on results
    if ($failedMigrations -eq 0) {
        Write-Success "All database operations completed successfully"
    }
    elseif ($successfulMigrations -gt 0) {
        Write-Warning "Database setup completed with some failures"
        Write-Host "  → Some services may not function properly" -ForegroundColor Yellow
        Write-Host "  → Check error messages above and consider manual intervention" -ForegroundColor Yellow
    }
    else {
        Write-Error "All database operations failed"
        Write-Host "  → The application may not start properly" -ForegroundColor Red
        Write-Host "  → Review error messages and fix issues before proceeding" -ForegroundColor Red
    }
}

# Phase 5: Completion and Summary
function Complete-Setup {
    Write-Phase "Setup Complete" 5
    
    # Calculate setup success rate
    $totalOperations = 4  # dependencies, env files, database, completion
    $successfulOperations = 0
    $criticalErrors = 0
    
    # Check if dependencies were installed (no errors in that phase means success)
    if (($script:Errors.Count -eq 0) -or -not ($script:Errors -match "Failed to install dependencies")) {
        $successfulOperations++
    } else {
        $criticalErrors++
    }
    
    # Check if any environment files were created or already existed
    if (($script:CreatedFiles.Count -gt 0) -or ($script:Warnings -match "already exists")) {
        $successfulOperations++
    }
    
    # Check if any database operations succeeded
    if (-not ($script:Errors -match "All database operations failed")) {
        $successfulOperations++
    }
    
    # Completion phase is always successful if we reach here
    $successfulOperations++
    
    # Display setup status
    $successRate = [math]::Round(($successfulOperations * 100 / $totalOperations), 0)
    
    if (($successRate -eq 100) -and ($script:Errors.Count -eq 0)) {
        Write-Host ""
        Write-Host "🎉 Developer environment setup completed successfully!" -ForegroundColor Green
        Write-Host "   All operations completed without errors" -ForegroundColor Green
        Write-Host ""
    }
    elseif ($successRate -ge 75) {
        Write-Host ""
        Write-Host "⚠️  Developer environment setup completed with warnings" -ForegroundColor Yellow
        Write-Host "   Setup success rate: $successRate%" -ForegroundColor Yellow
        Write-Host ""
    }
    else {
        Write-Host ""
        Write-Host "❌ Developer environment setup completed with significant issues" -ForegroundColor Red
        Write-Host "   Setup success rate: $successRate%" -ForegroundColor Red
        Write-Host ""
    }
    
    # Detailed summary sections
    if ($script:CreatedFiles.Count -gt 0) {
        Write-Host "✅ Successfully Created Files:" -ForegroundColor Blue
        foreach ($file in $script:CreatedFiles) {
            Write-Host "  • $file" -ForegroundColor Green
        }
        Write-Host ""
    }
    
    if ($script:Warnings.Count -gt 0) {
        Write-Host "⚠️  Warnings (Non-Critical Issues):" -ForegroundColor Yellow
        foreach ($warning in $script:Warnings) {
            Write-Host "  • $warning" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    if ($script:Errors.Count -gt 0) {
        Write-Host "❌ Errors Encountered:" -ForegroundColor Red
        foreach ($error in $script:Errors) {
            Write-Host "  • $error" -ForegroundColor Red
        }
        Write-Host ""
        Write-Host "💡 Recommendation: Review errors above and consider manual fixes" -ForegroundColor Yellow
        Write-Host ""
    }
    
    # Environment status check
    Write-Host "🔧 Environment Status Check:" -ForegroundColor Blue
    
    # Check service directories and .env files
    $servicesReady = 0
    $totalServices = 3
    
    foreach ($service in $Services.Keys) {
        $envFile = Join-Path $service ".env"
        if (Test-Path $envFile) {
            Write-Host "  ✓ $service service configured (PORT=$($Services[$service]))" -ForegroundColor Green
            $servicesReady++
        } else {
            Write-Host "  ✗ $service service missing .env file" -ForegroundColor Red
        }
    }
    
    # Check microservices
    if (Test-Path "microservices\.env") {
        Write-Host "  ✓ microservices configured" -ForegroundColor Green
    } else {
        Write-Host "  ✗ microservices missing .env file" -ForegroundColor Red
    }
    
    # Check database files
    $dbFilesExist = $false
    if (Test-Path ".db") {
        $dbFiles = Get-ChildItem ".db" -Filter "*.sqlite*" -ErrorAction SilentlyContinue
        if ($dbFiles.Count -gt 0) {
            Write-Host "  ✓ Database files created ($($dbFiles.Count) database(s))" -ForegroundColor Green
            $dbFilesExist = $true
        } else {
            Write-Host "  ⚠ Database directory exists but no database files found" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ✗ Database directory not found" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # Readiness assessment
    if (($servicesReady -eq $totalServices) -and $dbFilesExist -and ($script:Errors.Count -eq 0)) {
        Write-Host "🚀 Environment Status: READY" -ForegroundColor Green
        Write-Host "   Your development environment is fully configured and ready to use!"
    }
    elseif ($servicesReady -ge 2) {
        Write-Host "⚠️  Environment Status: PARTIALLY READY" -ForegroundColor Yellow
        Write-Host "   Most services are configured, but some issues may affect functionality"
    }
    else {
        Write-Host "❌ Environment Status: NEEDS ATTENTION" -ForegroundColor Red
        Write-Host "   Several critical issues need to be resolved before development"
    }
    
    Write-Host ""
    
    # Next steps with conditional guidance
    Write-Host "📋 Next Steps:" -ForegroundColor Blue
    
    if ($script:Errors.Count -gt 0) {
        Write-Host "  1. FIRST: Resolve the errors listed above" -ForegroundColor Red
        Write-Host "     • Review error messages and troubleshooting tips"
        Write-Host "     • Fix critical issues before starting services"
        Write-Host ""
        Write-Host "  2. After fixing errors, start the development environment:" -ForegroundColor Blue
    } else {
        Write-Host "  1. Start the development environment:" -ForegroundColor Blue
    }
    
    Write-Host "     .\run.sh                    # Start web + app services together" -ForegroundColor Green
    Write-Host ""
    Write-Host "  2. Or start services individually:" -ForegroundColor Blue
    Write-Host "     npm run app:dev             # Main app service (port 3001)" -ForegroundColor Green
    Write-Host "     npm run auth:dev            # Auth service (port 3000)" -ForegroundColor Green
    Write-Host "     npm run cat:dev             # Catalog service (port 3002)" -ForegroundColor Green
    Write-Host "     npm run web:dev             # Web frontend (Vite dev server)" -ForegroundColor Green
    Write-Host ""
    Write-Host "  3. Access the application:" -ForegroundColor Blue
    Write-Host "     • Frontend:    http://localhost:5173 (or as shown by Vite)" -ForegroundColor Green
    Write-Host "     • Auth API:    http://localhost:3000" -ForegroundColor Green
    Write-Host "     • App API:     http://localhost:3001" -ForegroundColor Green
    Write-Host "     • Catalog API: http://localhost:3002" -ForegroundColor Green
    Write-Host ""
    Write-Host "  4. Useful development commands:" -ForegroundColor Blue
    Write-Host "     npm run database:migrate-*  # Run specific migrations" -ForegroundColor Green
    Write-Host "     npm run database:seed       # Populate sample data" -ForegroundColor Green
    Write-Host "     npm test                    # Run tests" -ForegroundColor Green
    Write-Host ""
    
    # Final message based on setup status
    if ($script:Errors.Count -eq 0) {
        Write-Host "🎉 Happy coding! Your Chinook development environment is ready! 🚀" -ForegroundColor Green
    } else {
        Write-Host "💪 Almost there! Fix the issues above and you'll be ready to code! 🚀" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "📚 For more help:" -ForegroundColor Blue
    Write-Host "   • Check the project README.md for detailed documentation"
    Write-Host "   • Review individual service README files in their directories"
    Write-Host "   • Run this script again if you need to reconfigure"
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