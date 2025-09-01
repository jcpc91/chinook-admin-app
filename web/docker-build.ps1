# Docker build script for web service with environment-specific configurations

param(
    [Parameter(Position=0)]
    [ValidateSet("development", "dev", "staging", "production", "prod")]
    [string]$Environment = "development"
)

$ImageName = "chinook-web"

Write-Host "Building web service for environment: $Environment" -ForegroundColor Green

switch ($Environment) {
    { $_ -in "development", "dev" } {
        Write-Host "Building development image..." -ForegroundColor Yellow
        docker build --target development -t "${ImageName}:dev" .
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Development image built successfully: ${ImageName}:dev" -ForegroundColor Green
        } else {
            Write-Error "Development build failed"
            exit 1
        }
    }
    
    "staging" {
        Write-Host "Building staging image..." -ForegroundColor Yellow
        docker build --target production `
            --build-arg VITE_MODE=staging `
            --build-arg VITE_BASE_URL=http://app:3001 `
            --build-arg VITE_URL_AUTH=http://auth:3000 `
            -t "${ImageName}:staging" .
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Staging image built successfully: ${ImageName}:staging" -ForegroundColor Green
        } else {
            Write-Error "Staging build failed"
            exit 1
        }
    }
    
    { $_ -in "production", "prod" } {
        Write-Host "Building production image..." -ForegroundColor Yellow
        docker build --target production `
            --build-arg VITE_MODE=production `
            --build-arg VITE_BASE_URL=http://app:3001 `
            --build-arg VITE_URL_AUTH=http://auth:3000 `
            -t "${ImageName}:prod" .
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Production image built successfully: ${ImageName}:prod" -ForegroundColor Green
        } else {
            Write-Error "Production build failed"
            exit 1
        }
    }
}

Write-Host "Build completed successfully!" -ForegroundColor Green