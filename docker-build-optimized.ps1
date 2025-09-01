# Docker Build Optimization Script (PowerShell)
# This script demonstrates optimized build strategies for the Chinook application

param(
    [string]$Target = "production",
    [string[]]$Services = @("web", "app", "auth", "catalogos"),
    [string]$CacheFrom = "",
    [switch]$PerfTest,
    [switch]$Help
)

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    Cyan = "Cyan"
}

# Configuration
$EnableBuildKit = $true

# Function to print colored output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Function to print section headers
function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-ColorOutput "=== $Title ===" $Colors.Blue
}

# Function to build a service with optimization
function Build-Service {
    param(
        [string]$Service,
        [string]$Target
    )
    
    $Tag = "${Service}:${Target}"
    Write-ColorOutput "🔨 Building $Service ($Target stage)..." $Colors.Yellow
    
    # Build command with optimizations
    $BuildArgs = @(
        "build"
        "--target", $Target
        "-t", $Tag
    )
    
    # Add cache from if specified
    if ($CacheFrom) {
        $BuildArgs += "--cache-from", $CacheFrom
    }
    
    # Add build context
    $BuildArgs += "$Service/"
    
    # Execute build
    try {
        & docker $BuildArgs
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Successfully built $Tag" $Colors.Green
            
            # Show image size
            $ImageInfo = docker images --format "table {{.Size}}" $Tag | Select-Object -Skip 1
            Write-ColorOutput "📦 Image size: $ImageInfo" $Colors.Blue
        } else {
            throw "Build failed with exit code $LASTEXITCODE"
        }
    }
    catch {
        Write-ColorOutput "❌ Failed to build $Tag" $Colors.Red
        Write-ColorOutput "Error: $_" $Colors.Red
        exit 1
    }
}

# Function to show build statistics
function Show-BuildStats {
    Write-Section "Build Statistics"
    
    Write-ColorOutput "📊 Image Sizes:" $Colors.Blue
    foreach ($Service in $Services) {
        $Tag = "${Service}:${Target}"
        $ImageExists = docker images --format "table {{.Repository}}:{{.Tag}}" | Select-String $Tag
        if ($ImageExists) {
            docker images --format "table {{.Repository}}:{{.Tag}}`t{{.Size}}" | Select-String $Tag
        }
    }
    
    Write-Host ""
    Write-ColorOutput "💾 Docker System Usage:" $Colors.Blue
    docker system df
}

# Function to run build performance test
function Test-BuildPerformance {
    Write-Section "Build Performance Test"
    
    Write-ColorOutput "🚀 Running build performance test..." $Colors.Yellow
    
    foreach ($Service in $Services) {
        Write-Host ""
        Write-ColorOutput "Testing $Service build performance:" $Colors.Blue
        
        # First build (cold cache)
        Write-ColorOutput "Cold build:" $Colors.Yellow
        $ColdBuildTime = Measure-Command {
            docker build --no-cache --target $Target -t "${Service}:perf-test" "$Service/" | Out-Null
        }
        Write-Host "Time: $($ColdBuildTime.TotalSeconds) seconds"
        
        # Second build (warm cache)
        Write-ColorOutput "Warm build:" $Colors.Yellow
        $WarmBuildTime = Measure-Command {
            docker build --target $Target -t "${Service}:perf-test" "$Service/" | Out-Null
        }
        Write-Host "Time: $($WarmBuildTime.TotalSeconds) seconds"
        
        # Calculate improvement
        $Improvement = [math]::Round((($ColdBuildTime.TotalSeconds - $WarmBuildTime.TotalSeconds) / $ColdBuildTime.TotalSeconds) * 100, 2)
        Write-ColorOutput "Cache improvement: $Improvement%" $Colors.Green
        
        # Clean up test images
        docker rmi "${Service}:perf-test" 2>$null | Out-Null
    }
}

# Function to validate optimizations
function Test-Optimizations {
    Write-Section "Optimization Validation"
    
    foreach ($Service in $Services) {
        $Tag = "${Service}:${Target}"
        
        $ImageExists = docker images --format "table {{.Repository}}:{{.Tag}}" | Select-String $Tag
        if ($ImageExists) {
            Write-ColorOutput "🔍 Validating $Tag:" $Colors.Blue
            
            # Check if running as non-root user
            try {
                $UserId = docker run --rm $Tag id -u 2>$null
                if ($UserId -and $UserId -ne "0") {
                    Write-ColorOutput "✅ Running as non-root user (UID: $UserId)" $Colors.Green
                } else {
                    Write-ColorOutput "⚠️  Running as root user" $Colors.Yellow
                }
            }
            catch {
                Write-ColorOutput "⚠️  Could not determine user ID" $Colors.Yellow
            }
            
            # Check for dumb-init
            try {
                docker run --rm $Tag which dumb-init 2>$null | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-ColorOutput "✅ dumb-init present for signal handling" $Colors.Green
                } else {
                    Write-ColorOutput "⚠️  dumb-init not found" $Colors.Yellow
                }
            }
            catch {
                Write-ColorOutput "⚠️  Could not check for dumb-init" $Colors.Yellow
            }
            
            # Check image layers
            $Layers = (docker history --no-trunc $Tag | Measure-Object).Count
            Write-ColorOutput "📋 Image layers: $Layers" $Colors.Blue
        }
    }
}

# Function to show help
function Show-Help {
    Write-Host "Docker Build Optimization Script (PowerShell)"
    Write-Host ""
    Write-Host "Usage: .\docker-build-optimized.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Parameters:"
    Write-Host "  -Target      Build target (development|test|production) [default: production]"
    Write-Host "  -Services    Array of services [default: @('web','app','auth','catalogos')]"
    Write-Host "  -CacheFrom   Cache source image [optional]"
    Write-Host "  -PerfTest    Run build performance test"
    Write-Host "  -Help        Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\docker-build-optimized.ps1"
    Write-Host "  .\docker-build-optimized.ps1 -Target development"
    Write-Host "  .\docker-build-optimized.ps1 -Services @('web','app')"
    Write-Host "  .\docker-build-optimized.ps1 -Target production -PerfTest"
}

# Main execution
function Main {
    if ($Help) {
        Show-Help
        return
    }
    
    # Enable BuildKit for cache optimization
    if ($EnableBuildKit) {
        $env:DOCKER_BUILDKIT = "1"
        Write-ColorOutput "✅ BuildKit enabled for optimized builds" $Colors.Green
    }
    
    Write-Section "Docker Build Optimization"
    
    Write-ColorOutput "Configuration:" $Colors.Blue
    Write-Host "  Target: $Target"
    Write-Host "  Services: $($Services -join ', ')"
    Write-Host "  BuildKit: $EnableBuildKit"
    
    # Build all services
    Write-Section "Building Services"
    foreach ($Service in $Services) {
        Build-Service -Service $Service -Target $Target
    }
    
    # Show statistics
    Show-BuildStats
    
    # Validate optimizations
    Test-Optimizations
    
    # Performance test (optional)
    if ($PerfTest) {
        Test-BuildPerformance
    }
    
    Write-Section "Build Complete"
    Write-ColorOutput "🎉 All services built successfully with optimizations!" $Colors.Green
    
    Write-Host ""
    Write-ColorOutput "💡 Tips:" $Colors.Blue
    Write-Host "  • Use '-Target development' for dev builds"
    Write-Host "  • Use '-Target test' for testing"
    Write-Host "  • Enable BuildKit for cache optimization"
    Write-Host "  • Monitor build context size with .dockerignore"
}

# Run main function
Main