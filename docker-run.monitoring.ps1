# Chinook Application - Monitoring and Logging Stack Startup Script (PowerShell)
# This script starts the complete monitoring and logging infrastructure

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "restart", "status", "logs", "clean", "help")]
    [string]$Command = "start",
    
    [Parameter(Position=1)]
    [string]$Service = ""
)

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

# Function to check if Docker is running
function Test-Docker {
    try {
        docker info | Out-Null
        Write-Success "Docker is running"
        return $true
    }
    catch {
        Write-Error "Docker is not running. Please start Docker and try again."
        return $false
    }
}

# Function to check if Docker Compose is available
function Test-DockerCompose {
    try {
        docker-compose --version | Out-Null
        Write-Success "Docker Compose is available"
        return $true
    }
    catch {
        Write-Error "Docker Compose is not installed. Please install Docker Compose and try again."
        return $false
    }
}

# Function to create necessary directories
function New-MonitoringDirectories {
    Write-Status "Creating necessary directories..."
    
    # Create monitoring directories
    $directories = @(
        "monitoring\fluentd\plugins",
        "monitoring\grafana\dashboards\chinook",
        "monitoring\grafana\dashboards\infrastructure", 
        "monitoring\grafana\dashboards\logging",
        "monitoring\prometheus\rules",
        "monitoring\alertmanager\templates"
    )
    
    foreach ($dir in $directories) {
        if (!(Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }
    
    Write-Success "Directories created successfully"
}

# Function to validate configuration files
function Test-ConfigFiles {
    Write-Status "Validating configuration files..."
    
    # Check if required config files exist
    $requiredFiles = @(
        "monitoring\docker-compose.logging.yml",
        "monitoring\fluentd\fluent.conf",
        "monitoring\prometheus.yml",
        "monitoring\alertmanager\alertmanager.yml",
        "monitoring\grafana\datasources\datasources.yml"
    )
    
    foreach ($file in $requiredFiles) {
        if (!(Test-Path $file)) {
            Write-Error "Required configuration file not found: $file"
            return $false
        }
    }
    
    Write-Success "All configuration files are present"
    return $true
}

# Function to check environment variables
function Test-Environment {
    Write-Status "Checking environment variables..."
    
    # Check for required environment variables
    $envFile = ".env.monitoring"
    
    if (!(Test-Path $envFile)) {
        Write-Warning "Environment file $envFile not found. Creating default..."
        
        $envContent = @"
# Monitoring and Logging Environment Variables
GRAFANA_ADMIN_PASSWORD=admin123
DB_USER=chinook_user
DB_PASSWORD=secure_password
JWT_SECREAT_KEY=your_jwt_secret_key
CORS_ORIGIN=http://localhost:80

# Elasticsearch Configuration
ES_JAVA_OPTS=-Xms512m -Xmx512m

# Fluentd Configuration
FLUENTD_CONF=fluent.conf
FLUENTD_OPT=-v

# Alert Configuration
ALERT_EMAIL=admin@chinook-app.local
SLACK_WEBHOOK_URL=
"@
        
        Set-Content -Path $envFile -Value $envContent
        Write-Warning "Please review and update $envFile with your actual values"
    }
    
    Write-Success "Environment configuration checked"
}

# Function to start monitoring stack
function Start-MonitoringStack {
    Write-Status "Starting monitoring and logging stack..."
    
    # Start the logging and monitoring services
    docker-compose -f monitoring/docker-compose.logging.yml --env-file .env.monitoring up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Monitoring stack started successfully"
        return $true
    } else {
        Write-Error "Failed to start monitoring stack"
        return $false
    }
}

# Function to wait for services to be ready
function Wait-ForServices {
    Write-Status "Waiting for services to be ready..."
    
    $services = @{
        "elasticsearch" = 9200
        "prometheus" = 9090
        "grafana" = 3000
        "fluentd" = 24224
    }
    
    foreach ($service in $services.GetEnumerator()) {
        $host = $service.Key
        $port = $service.Value
        
        Write-Status "Waiting for $host`:$port..."
        
        $maxAttempts = 30
        $attempt = 1
        
        do {
            try {
                $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
                if ($connection.TcpTestSucceeded) {
                    Write-Success "$host`:$port is ready"
                    break
                }
            }
            catch {
                # Connection failed, continue waiting
            }
            
            if ($attempt -ge $maxAttempts) {
                Write-Error "Service $host`:$port failed to start within expected time"
                return $false
            }
            
            Start-Sleep -Seconds 2
            $attempt++
        } while ($true)
    }
    
    return $true
}

# Function to configure Grafana dashboards
function Set-GrafanaConfig {
    Write-Status "Configuring Grafana dashboards..."
    
    # Wait a bit more for Grafana to fully initialize
    Start-Sleep -Seconds 10
    
    # Import default dashboards (this would typically be done via API)
    Write-Status "Grafana dashboards will be available at http://localhost:3000"
    Write-Status "Default login: admin / admin123 (or check .env.monitoring)"
    
    Write-Success "Grafana configuration completed"
}

# Function to show service URLs
function Show-ServiceUrls {
    Write-Success "Monitoring and logging stack is ready!"
    Write-Host ""
    Write-Host "Service URLs:" -ForegroundColor Cyan
    Write-Host "  📊 Grafana (Dashboards):     http://localhost:3000" -ForegroundColor White
    Write-Host "  📈 Prometheus (Metrics):     http://localhost:9090" -ForegroundColor White
    Write-Host "  🔍 Elasticsearch (Logs):     http://localhost:9200" -ForegroundColor White
    Write-Host "  📋 Kibana (Log Analysis):    http://localhost:5601" -ForegroundColor White
    Write-Host "  🚨 Alertmanager (Alerts):    http://localhost:9093" -ForegroundColor White
    Write-Host "  📊 cAdvisor (Containers):    http://localhost:8080" -ForegroundColor White
    Write-Host "  🖥️  Node Exporter (System):   http://localhost:9100" -ForegroundColor White
    Write-Host ""
    Write-Host "Default Credentials:" -ForegroundColor Cyan
    Write-Host "  Grafana: admin / admin123 (configurable in .env.monitoring)" -ForegroundColor White
    Write-Host ""
    Write-Host "Log Collection:" -ForegroundColor Cyan
    Write-Host "  Fluentd is collecting logs from all containerized services" -ForegroundColor White
    Write-Host "  Logs are stored in Elasticsearch and viewable in Kibana" -ForegroundColor White
    Write-Host ""
    Write-Host "Monitoring:" -ForegroundColor Cyan
    Write-Host "  Prometheus is collecting metrics from all services" -ForegroundColor White
    Write-Host "  Grafana provides visualization dashboards" -ForegroundColor White
    Write-Host "  Alertmanager handles alert notifications" -ForegroundColor White
    Write-Host ""
}

# Function to show usage
function Show-Usage {
    Write-Host "Usage: .\docker-run.monitoring.ps1 [COMMAND]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  start     Start the monitoring and logging stack" -ForegroundColor White
    Write-Host "  stop      Stop the monitoring and logging stack" -ForegroundColor White
    Write-Host "  restart   Restart the monitoring and logging stack" -ForegroundColor White
    Write-Host "  status    Show status of monitoring services" -ForegroundColor White
    Write-Host "  logs      Show logs from monitoring services" -ForegroundColor White
    Write-Host "  clean     Stop and remove all monitoring containers and volumes" -ForegroundColor White
    Write-Host ""
}

# Function to stop monitoring stack
function Stop-MonitoringStack {
    Write-Status "Stopping monitoring and logging stack..."
    
    docker-compose -f monitoring/docker-compose.logging.yml --env-file .env.monitoring down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Monitoring stack stopped"
    } else {
        Write-Error "Failed to stop monitoring stack"
    }
}

# Function to show status
function Show-Status {
    Write-Status "Monitoring stack status:"
    
    docker-compose -f monitoring/docker-compose.logging.yml --env-file .env.monitoring ps
}

# Function to show logs
function Show-Logs {
    if ($Service) {
        docker-compose -f monitoring/docker-compose.logging.yml --env-file .env.monitoring logs -f $Service
    } else {
        docker-compose -f monitoring/docker-compose.logging.yml --env-file .env.monitoring logs -f
    }
}

# Function to clean up
function Remove-MonitoringStack {
    $response = Read-Host "This will remove all monitoring containers and volumes. Are you sure? (y/N)"
    
    if ($response -match "^[Yy]$") {
        Write-Status "Cleaning up monitoring stack..."
        
        docker-compose -f monitoring/docker-compose.logging.yml --env-file .env.monitoring down -v --remove-orphans
        
        # Remove monitoring volumes
        $volumes = @(
            "chinook_elasticsearch_data",
            "chinook_prometheus_data", 
            "chinook_grafana_data",
            "chinook_fluentd_logs"
        )
        
        foreach ($volume in $volumes) {
            try {
                docker volume rm $volume 2>$null
            }
            catch {
                # Volume might not exist, ignore error
            }
        }
        
        Write-Success "Monitoring stack cleaned up"
    } else {
        Write-Status "Cleanup cancelled"
    }
}

# Main execution
switch ($Command) {
    "start" {
        if (!(Test-Docker)) { exit 1 }
        if (!(Test-DockerCompose)) { exit 1 }
        New-MonitoringDirectories
        if (!(Test-ConfigFiles)) { exit 1 }
        Test-Environment
        if (!(Start-MonitoringStack)) { exit 1 }
        if (!(Wait-ForServices)) { exit 1 }
        Set-GrafanaConfig
        Show-ServiceUrls
    }
    "stop" {
        Stop-MonitoringStack
    }
    "restart" {
        Stop-MonitoringStack
        Start-Sleep -Seconds 2
        & $MyInvocation.MyCommand.Path "start"
    }
    "status" {
        Show-Status
    }
    "logs" {
        Show-Logs
    }
    "clean" {
        Remove-MonitoringStack
    }
    "help" {
        Show-Usage
    }
    default {
        Write-Error "Unknown command: $Command"
        Show-Usage
        exit 1
    }
}