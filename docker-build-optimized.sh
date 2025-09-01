#!/bin/bash

# Docker Build Optimization Script
# This script demonstrates optimized build strategies for the Chinook application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENABLE_BUILDKIT=true
BUILD_TARGET=${1:-production}
SERVICES=${2:-"web app auth catalogos"}
CACHE_FROM=${3:-""}

# Enable BuildKit for cache optimization
if [ "$ENABLE_BUILDKIT" = true ]; then
    export DOCKER_BUILDKIT=1
    echo -e "${GREEN}✅ BuildKit enabled for optimized builds${NC}"
fi

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Function to build a service with optimization
build_service() {
    local service=$1
    local target=$2
    local tag="${service}:${target}"
    
    echo -e "${YELLOW}🔨 Building ${service} (${target} stage)...${NC}"
    
    # Build command with optimizations
    local build_cmd="docker build"
    
    # Add cache from if specified
    if [ -n "$CACHE_FROM" ]; then
        build_cmd="$build_cmd --cache-from $CACHE_FROM"
    fi
    
    # Add target and tag
    build_cmd="$build_cmd --target $target -t $tag"
    
    # Add build context
    build_cmd="$build_cmd $service/"
    
    # Execute build
    if eval $build_cmd; then
        echo -e "${GREEN}✅ Successfully built ${tag}${NC}"
        
        # Show image size
        local size=$(docker images --format "table {{.Size}}" $tag | tail -n 1)
        echo -e "${BLUE}📦 Image size: ${size}${NC}"
    else
        echo -e "${RED}❌ Failed to build ${tag}${NC}"
        exit 1
    fi
}

# Function to show build statistics
show_build_stats() {
    print_section "Build Statistics"
    
    echo -e "${BLUE}📊 Image Sizes:${NC}"
    for service in $SERVICES; do
        local tag="${service}:${BUILD_TARGET}"
        if docker images --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}" | grep -q "$tag"; then
            docker images --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}" | grep "$tag"
        fi
    done
    
    echo -e "\n${BLUE}💾 Docker System Usage:${NC}"
    docker system df
}

# Function to run build performance test
performance_test() {
    print_section "Build Performance Test"
    
    echo -e "${YELLOW}🚀 Running build performance test...${NC}"
    
    for service in $SERVICES; do
        echo -e "\n${BLUE}Testing ${service} build performance:${NC}"
        
        # First build (cold cache)
        echo -e "${YELLOW}Cold build:${NC}"
        time docker build --no-cache --target $BUILD_TARGET -t "${service}:perf-test" "$service/" > /dev/null 2>&1
        
        # Second build (warm cache)
        echo -e "${YELLOW}Warm build:${NC}"
        time docker build --target $BUILD_TARGET -t "${service}:perf-test" "$service/" > /dev/null 2>&1
        
        # Clean up test images
        docker rmi "${service}:perf-test" > /dev/null 2>&1 || true
    done
}

# Function to validate optimizations
validate_optimizations() {
    print_section "Optimization Validation"
    
    for service in $SERVICES; do
        local tag="${service}:${BUILD_TARGET}"
        
        if docker images --format "table {{.Repository}}:{{.Tag}}" | grep -q "$tag"; then
            echo -e "${BLUE}🔍 Validating ${tag}:${NC}"
            
            # Check if running as non-root user
            local user=$(docker run --rm "$tag" id -u 2>/dev/null || echo "unknown")
            if [ "$user" != "0" ] && [ "$user" != "unknown" ]; then
                echo -e "${GREEN}✅ Running as non-root user (UID: $user)${NC}"
            else
                echo -e "${YELLOW}⚠️  Running as root user${NC}"
            fi
            
            # Check for dumb-init
            if docker run --rm "$tag" which dumb-init > /dev/null 2>&1; then
                echo -e "${GREEN}✅ dumb-init present for signal handling${NC}"
            else
                echo -e "${YELLOW}⚠️  dumb-init not found${NC}"
            fi
            
            # Check image layers
            local layers=$(docker history --no-trunc "$tag" | wc -l)
            echo -e "${BLUE}📋 Image layers: $layers${NC}"
            
        fi
    done
}

# Main execution
main() {
    print_section "Docker Build Optimization"
    
    echo -e "${BLUE}Configuration:${NC}"
    echo -e "  Target: ${BUILD_TARGET}"
    echo -e "  Services: ${SERVICES}"
    echo -e "  BuildKit: ${ENABLE_BUILDKIT}"
    
    # Build all services
    print_section "Building Services"
    for service in $SERVICES; do
        build_service "$service" "$BUILD_TARGET"
    done
    
    # Show statistics
    show_build_stats
    
    # Validate optimizations
    validate_optimizations
    
    # Performance test (optional)
    if [ "$4" = "--perf-test" ]; then
        performance_test
    fi
    
    print_section "Build Complete"
    echo -e "${GREEN}🎉 All services built successfully with optimizations!${NC}"
    
    echo -e "\n${BLUE}💡 Tips:${NC}"
    echo -e "  • Use 'docker build --target development' for dev builds"
    echo -e "  • Use 'docker build --target test' for testing"
    echo -e "  • Enable BuildKit for cache optimization"
    echo -e "  • Monitor build context size with .dockerignore"
}

# Help function
show_help() {
    echo "Docker Build Optimization Script"
    echo ""
    echo "Usage: $0 [TARGET] [SERVICES] [CACHE_FROM] [OPTIONS]"
    echo ""
    echo "Arguments:"
    echo "  TARGET      Build target (development|test|production) [default: production]"
    echo "  SERVICES    Space-separated list of services [default: 'web app auth catalogos']"
    echo "  CACHE_FROM  Cache source image [optional]"
    echo ""
    echo "Options:"
    echo "  --perf-test Run build performance test"
    echo "  --help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Build all services for production"
    echo "  $0 development                        # Build all services for development"
    echo "  $0 production 'web app'               # Build only web and app services"
    echo "  $0 production 'web app' '' --perf-test # Build with performance test"
}

# Check for help flag
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

# Run main function
main "$@"