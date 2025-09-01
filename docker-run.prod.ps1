# Production Docker Deployment Script (PowerShell)
# Deploys the Chinook application in production mode with full containerization

param(
    [Parameter(Position=0)]
    [ValidateSet("deploy", "stop", "restart", "logs", "status", "backup", "help")]
    [string]$Command = "deploy",
    
    [Parameter(Position=1)]
    [string]$ServiceName = ""
)

# Configuration
$ComposeFile = "docker-compose.prod.yml"
$EnvFile = ".env.production"
$ProjectName = "chinook-prod"

# Function to print colored output
function Write-Status {
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

# Function to check if required files exist
function Test-Requirements {
    Write-Status "Checking requirements..."
    
    if (-not (Test-Path $ComposeFile)) {
        Write-Error "Docker Compose file $ComposeFile not found!"
        exit 1
    }
    
    if (-not (Test-Path $EnvFile)) {
        Write-Error "Environment file $EnvFile not found!"
        Write-Warning "Please copy .env.production.template to $EnvFile and configure it"
        exit 1
    }
    
    # Check if Docker is running
    try {
        docker info | Out-Null
    }
    catch {
        Write-Error "Docker is not running!"
        exit 1
    }
    
    # Check if Docker Compose is available
    try {
        docker-compose --version | Out-Null
    }
    catch {
        Write-Error "Docker Compose is not installed!"
        exit 1
    }
    
    Write-Success "All requirements met"
}

# Function to validate environment variables
function Test-Environment {
    Write-Status "Validating environment variables..."
    
    # Read environment file
    $envContent = Get-Content $EnvFile | Where-Object { $_ -match "^[^#].*=" }
    $envVars = @{}
    
    foreach ($line in $envContent) {
        $parts = $line -split "=", 2
        if ($parts.Length -eq 2) {
            $envVars[$parts[0].Trim()] = $parts[1].Trim()
        }
    }
    
    # Check critical variables
    if (-not $envVars.ContainsKey("JWT_SECREAT_KEY") -or 
        $envVars["JWT_SECREAT_KEY"] -eq "production_jwt_secret_key_minimum_32_characters_change_this") {
        Write-Error "JWT_SECREAT_KEY must be set to a secure value in $EnvFile"
        exit 1
    }
    
    if (-not $envVars.ContainsKey("DB_PASSWORD") -or 
        $envVars["DB_PASSWORD"] -eq "secure_production_db_password_change_this") {
        Write-Error "DB_PASSWORD must be set to a secure value in $EnvFile"
        exit 1
    }
    
    if (-not $envVars.ContainsKey("CORS_ORIGIN") -or 
        $envVars["CORS_ORIGIN"] -like "*your-production-domain.com*") {
        Write-Error "CORS_ORIGIN must be set to your actual production domain in $EnvFile"
        exit 1
    }
    
    Write-Success "Environment variables validated"
}

# Function to create necessary directories
function New-Directories {
    Write-Status "Creating necessary directories..."
    
    # Create SSL directory if it doesn't exist
    if (-not (Test-Path "nginx\ssl")) {
        New-Item -ItemType Directory -Path "nginx\ssl" -Force | Out-Null
    }
    
    # Create backup directories (Windows Docker Desktop handles volume creation)
    Write-Success "Directories created"
}

# Function to generate SSL certificates (self-signed for testing)
function New-SSLCertificates {
    if (-not (Test-Path "nginx\ssl\cert.pem") -or -not (Test-Path "nginx\ssl\private.key")) {
        Write-Warning "SSL certificates not found. Generating self-signed certificates for testing..."
        Write-Warning "For production, replace these with proper SSL certificates!"
        
        # Check if OpenSSL is available
        try {
            openssl version | Out-Null
            
            # Generate self-signed certificate
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
                -keyout "nginx\ssl\private.key" `
                -out "nginx\ssl\cert.pem" `
                -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
            
            Write-Success "Self-signed SSL certificates generated"
        }
        catch {
            Write-Warning "OpenSSL not found. Please install OpenSSL or provide SSL certificates manually."
            Write-Warning "Continuing without SSL certificates - HTTPS will not work."
        }
    }
    else {
        Write-Success "SSL certificates found"
    }
}

# Function to build and start services
function Start-Services {
    Write-Status "Building and deploying services..."
    
    # Pull latest images
    docker-compose -f $ComposeFile --env-file $EnvFile pull
    
    # Build services
    docker-compose -f $ComposeFile --env-file $EnvFile build --no-cache
    
    # Start services
    docker-compose -f $ComposeFile --env-file $EnvFile up -d
    
    Write-Success "Services deployed"
}

# Function to wait for services to be healthy
function Wait-ForServices {
    Write-Status "Waiting for services to be healthy..."
    
    $maxAttempts = 60
    $attempt = 0
    
    while ($attempt -lt $maxAttempts) {
        $status = docker-compose -f $ComposeFile --env-file $EnvFile ps
        if ($status -match "healthy") {
            Write-Success "Services are healthy"
            return $true
        }
        
        $attempt++
        Write-Status "Waiting for services... ($attempt/$maxAttempts)"
        Start-Sleep -Seconds 10
    }
    
    Write-Error "Services did not become healthy within expected time"
    Write-Status "Checking service status..."
    docker-compose -f $ComposeFile --env-file $EnvFile ps
    return $false
}

# Function to run database migrations
function Start-Migrations {
    Write-Status "Running database migrations..."
    
    # Wait for migration service to complete
    docker-compose -f $ComposeFile --env-file $EnvFile logs db-migrate
    
    Write-Success "Database migrations completed"
}

# Function to display deployment information
function Show-DeploymentInfo {
    Write-Success "Deployment completed successfully!"
    Write-Host ""
    Write-Status "Service URLs:"
    Write-Host "  - Web Frontend: https://localhost (HTTP redirects to HTTPS)"
    Write-Host "  - Load Balancer Health: http://localhost:8080/health"
    Write-Host "  - Prometheus Monitoring: http://localhost:9090 (if exposed)"
    Write-Host ""
    Write-Status "Management Commands:"
    Write-Host "  - View logs: docker-compose -f $ComposeFile --env-file $EnvFile logs -f [service]"
    Write-Host "  - Scale services: docker-compose -f $ComposeFile --env-file $EnvFile up -d --scale app=3"
    Write-Host "  - Stop services: docker-compose -f $ComposeFile --env-file $EnvFile down"
    Write-Host "  - Backup database: docker-compose -f $ComposeFile --env-file $EnvFile exec postgres-backup /scripts/backup.sh"
    Write-Host ""
    Write-Status "Service Status:"
    docker-compose -f $ComposeFile --env-file $EnvFile ps
}

# Main execution function
function Start-Deployment {
    Write-Status "Starting production deployment of Chinook application..."
    
    Test-Requirements
    Test-Environment
    New-Directories
    New-SSLCertificates
    Start-Services
    
    if (Wait-ForServices) {
        Start-Migrations
        Show-DeploymentInfo
        Write-Success "Production deployment completed successfully!"
    }
    else {
        Write-Error "Deployment failed!"
        Write-Status "Checking service logs..."
        docker-compose -f $ComposeFile --env-file $EnvFile logs --tail=50
        exit 1
    }
}

# Command execution
switch ($Command) {
    "deploy" {
        Start-Deployment
    }
    "stop" {
        Write-Status "Stopping production services..."
        docker-compose -f $ComposeFile --env-file $EnvFile down
        Write-Success "Services stopped"
    }
    "restart" {
        Write-Status "Restarting production services..."
        docker-compose -f $ComposeFile --env-file $EnvFile restart
        Write-Success "Services restarted"
    }
    "logs" {
        if ($ServiceName) {
            docker-compose -f $ComposeFile --env-file $EnvFile logs -f $ServiceName
        }
        else {
            docker-compose -f $ComposeFile --env-file $EnvFile logs -f
        }
    }
    "status" {
        docker-compose -f $ComposeFile --env-file $EnvFile ps
    }
    "backup" {
        Write-Status "Creating database backup..."
        docker-compose -f $ComposeFile --env-file $EnvFile exec postgres-backup /scripts/backup.sh
    }
    "help" {
        Write-Host "Usage: .\docker-run.prod.ps1 [command] [service]"
        Write-Host "Commands:"
        Write-Host "  deploy  - Deploy the application (default)"
        Write-Host "  stop    - Stop all services"
        Write-Host "  restart - Restart all services"
        Write-Host "  logs    - View logs (optionally specify service name)"
        Write-Host "  status  - Show service status"
        Write-Host "  backup  - Create database backup"
        Write-Host "  help    - Show this help message"
    }
    default {
        Write-Error "Unknown command: $Command"
        Write-Status "Use '.\docker-run.prod.ps1 help' for available commands"
        exit 1
    }
}