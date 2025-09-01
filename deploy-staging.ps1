# PowerShell Staging Deployment Script
# Automated deployment script for staging environment with validation and rollback capabilities

param(
    [switch]$NoRollback,
    [switch]$Help
)

# Configuration
$ComposeFile = "docker-compose.staging.yml"
$EnvFile = ".env.staging"
$BackupDir = "./backups/staging"
$LogFile = "./logs/deploy-staging-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
$HealthCheckTimeout = 300  # 5 minutes
$RollbackEnabled = -not $NoRollback

# Function to write log messages
function Write-Log {
    param(
        [string]$Level,
        [string]$Message
    )
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $logMessage = "$timestamp [$Level] $Message"
    Write-Host $logMessage
    Add-Content -Path $LogFile -Value $logMessage
}

function Write-Info { param([string]$Message) Write-Log "INFO" $Message }
function Write-Warn { param([string]$Message) Write-Host $Message -ForegroundColor Yellow; Write-Log "WARN" $Message }
function Write-Error { param([string]$Message) Write-Host $Message -ForegroundColor Red; Write-Log "ERROR" $Message }
function Write-Success { param([string]$Message) Write-Host $Message -ForegroundColor Green; Write-Log "SUCCESS" $Message }

# Function to show help
function Show-Help {
    Write-Host @"
PowerShell Staging Deployment Script

Usage: .\deploy-staging.ps1 [OPTIONS]

Options:
  -NoRollback    Disable automatic rollback on failure
  -Help          Show this help message

Examples:
  .\deploy-staging.ps1
  .\deploy-staging.ps1 -NoRollback

"@
}

# Function to check prerequisites
function Test-Prerequisites {
    Write-Info "Checking deployment prerequisites..."
    
    # Check Docker
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed or not in PATH"
        exit 1
    }
    
    try {
        docker info | Out-Null
    } catch {
        Write-Error "Docker daemon is not running"
        exit 1
    }
    
    # Check Docker Compose
    if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Error "docker-compose is not installed or not in PATH"
        exit 1
    }
    
    # Check required files
    if (-not (Test-Path $ComposeFile)) {
        Write-Error "Compose file $ComposeFile not found"
        exit 1
    }
    
    if (-not (Test-Path $EnvFile)) {
        Write-Error "Environment file $EnvFile not found"
        Write-Info "Creating default environment file..."
        New-DefaultEnvFile
    }
    
    # Check disk space (minimum 5GB)
    $drive = (Get-Location).Drive
    $freeSpace = (Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='$($drive.Name)'").FreeSpace / 1GB
    if ($freeSpace -lt 5) {
        Write-Warn "Low disk space detected. Available: $([math]::Round($freeSpace, 2))GB"
        Write-Warn "Consider cleaning up with: docker system prune"
    }
    
    Write-Success "Prerequisites check completed"
}

# Function to create default environment file
function New-DefaultEnvFile {
    $jwtSecret = [System.Web.Security.Membership]::GeneratePassword(32, 0)
    $dbPassword = [System.Web.Security.Membership]::GeneratePassword(24, 0)
    
    $envContent = @"
# Staging Environment Variables
# Generated automatically - please review and update as needed

# JWT Configuration
JWT_SECREAT_KEY=$jwtSecret

# Database Configuration
DB_USER=chinook_user
DB_PASSWORD=$dbPassword

# CORS Configuration
CORS_ORIGIN=http://localhost:80,http://127.0.0.1:80

# Logging Configuration
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
"@
    
    Set-Content -Path $EnvFile -Value $envContent
    Write-Success "Default environment file created at $EnvFile"
    Write-Warn "Please review and update $EnvFile with your staging-specific values"
}

# Function to validate environment variables
function Test-Environment {
    Write-Info "Validating environment configuration..."
    
    if (-not (Test-Path $EnvFile)) {
        Write-Error "Environment file $EnvFile not found"
        exit 1
    }
    
    # Read environment variables
    $envVars = @{}
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $envVars[$matches[1]] = $matches[2]
        }
    }
    
    # Check required variables
    $requiredVars = @('JWT_SECREAT_KEY', 'DB_USER', 'DB_PASSWORD', 'CORS_ORIGIN')
    $missingVars = @()
    
    foreach ($var in $requiredVars) {
        if (-not $envVars.ContainsKey($var) -or [string]::IsNullOrEmpty($envVars[$var])) {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Error "Missing required environment variables: $($missingVars -join ', ')"
        exit 1
    }
    
    # Validate JWT secret length
    if ($envVars['JWT_SECREAT_KEY'].Length -lt 32) {
        Write-Error "JWT_SECREAT_KEY must be at least 32 characters long"
        exit 1
    }
    
    # Validate database password length
    if ($envVars['DB_PASSWORD'].Length -lt 16) {
        Write-Error "DB_PASSWORD must be at least 16 characters long"
        exit 1
    }
    
    Write-Success "Environment validation completed"
}

# Function to deploy services
function Start-Deployment {
    Write-Info "Starting staging deployment..."
    
    # Create log directory
    $logDir = Split-Path $LogFile -Parent
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    
    try {
        Test-Prerequisites
        Test-Environment
        
        Write-Info "Building and starting services..."
        & docker-compose -f $ComposeFile --env-file $EnvFile up -d --build
        
        if ($LASTEXITCODE -ne 0) {
            throw "Service deployment failed"
        }
        
        Write-Info "Waiting for services to be ready..."
        Start-Sleep -Seconds 30
        
        # Perform health checks
        $healthCheckPassed = Test-ServiceHealth
        
        if ($healthCheckPassed) {
            Write-Success "Staging deployment completed successfully"
            Show-DeploymentSummary
        } else {
            throw "Health checks failed"
        }
        
    } catch {
        Write-Error "Deployment failed: $($_.Exception.Message)"
        
        if ($RollbackEnabled) {
            Write-Warn "Rolling back deployment..."
            & docker-compose -f $ComposeFile --env-file $EnvFile down --remove-orphans
        }
        
        exit 1
    }
}

# Function to test service health
function Test-ServiceHealth {
    Write-Info "Performing health checks..."
    
    $endpoints = @(
        @{ Name = "Web"; Url = "http://localhost:80/" },
        @{ Name = "Auth"; Url = "http://localhost:3000/health" },
        @{ Name = "App"; Url = "http://localhost:3001/health" },
        @{ Name = "Catalogos"; Url = "http://localhost:3002/health" }
    )
    
    $allHealthy = $true
    
    foreach ($endpoint in $endpoints) {
        $attempts = 0
        $maxAttempts = 30
        $healthy = $false
        
        while ($attempts -lt $maxAttempts) {
            try {
                $response = Invoke-WebRequest -Uri $endpoint.Url -TimeoutSec 10 -UseBasicParsing
                if ($response.StatusCode -eq 200) {
                    Write-Success "$($endpoint.Name) service is healthy"
                    $healthy = $true
                    break
                }
            } catch {
                # Service not ready yet
            }
            
            $attempts++
            Write-Info "Health check for $($endpoint.Name)... ($attempts/$maxAttempts)"
            Start-Sleep -Seconds 10
        }
        
        if (-not $healthy) {
            Write-Error "$($endpoint.Name) service health check failed"
            $allHealthy = $false
        }
    }
    
    return $allHealthy
}

# Function to show deployment summary
function Show-DeploymentSummary {
    Write-Info "Deployment Summary"
    Write-Host "===================="
    
    Write-Host "`nService Status:" -ForegroundColor Blue
    & docker-compose -f $ComposeFile --env-file $EnvFile ps
    
    Write-Host "`nAccess Points:" -ForegroundColor Blue
    Write-Host "- Web Application: http://localhost:80"
    Write-Host "- Auth Service: http://localhost:3000"
    Write-Host "- App Service: http://localhost:3001"
    Write-Host "- Catalogos Service: http://localhost:3002"
    Write-Host "- PostgreSQL: localhost:5432"
    Write-Host "- ElasticMQ: http://localhost:9324"
    
    Write-Host "`nUseful Commands:" -ForegroundColor Blue
    Write-Host "- View logs: docker-compose -f $ComposeFile --env-file $EnvFile logs -f"
    Write-Host "- Check health: Invoke-WebRequest http://localhost:80/"
    Write-Host "- Stop services: docker-compose -f $ComposeFile --env-file $EnvFile down"
}

# Main execution
if ($Help) {
    Show-Help
    exit 0
}

# Add System.Web assembly for password generation
Add-Type -AssemblyName System.Web

Start-Deployment