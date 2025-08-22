
# Development Environment Startup Script (PowerShell)
# Starts the hybrid development environment:
# - Local backend services (auth, app, catalogos)
# - Containerized web frontend service

# Global variables for process management
$global:AuthProcess = $null
$global:AppProcess = $null
$global:CatalogosProcess = $null
$global:DockerProcess = $null

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

Write-Host "🚀 Starting Chinook Development Environment (Hybrid Mode)" -ForegroundColor Blue
Write-Host "========================================================" -ForegroundColor Blue
Write-Host "Frontend: Containerized (Docker) - http://localhost:5173" -ForegroundColor Green
Write-Host "Backend Services: Local processes" -ForegroundColor Green
Write-Host "  - Auth: http://localhost:3000" -ForegroundColor White
Write-Host "  - App: http://localhost:3001" -ForegroundColor White
Write-Host "  - Catalogos: http://localhost:3002 (if available)" -ForegroundColor White
Write-Host ""

if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}

Write-Status "Step 1: Starting local backend services..."

# Start auth service
Write-Status "Starting auth service ..."

# Start the auth service using cmd.exe to run npm
$authDir = Join-Path -Path $PSScriptRoot -ChildPath "auth"
$global:AuthProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run start" -WorkingDirectory $authDir -PassThru -NoNewWindow
Write-Success "Auth service started (PID: $($global:AuthProcess.Id))"
