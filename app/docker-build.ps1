# Build script for chinook-app service container (PowerShell)
# Usage: .\docker-build.ps1 [environment] [tag]

param(
    [string]$Environment = "development",
    [string]$Tag = "latest"
)

$ServiceName = "chinook-app"

Write-Host "Building $ServiceName container for $Environment environment..." -ForegroundColor Green

# Build the container with the specified target stage
docker build `
  --target $Environment `
  --tag "${ServiceName}:${Environment}-${Tag}" `
  --build-arg PORT=3001 `
  .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully built ${ServiceName}:${Environment}-${Tag}" -ForegroundColor Green
    Write-Host ""
    Write-Host "To run the container:" -ForegroundColor Yellow
    Write-Host "docker run -p 3001:3001 --env-file .env.$Environment ${ServiceName}:${Environment}-${Tag}" -ForegroundColor Cyan
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}