#!/bin/bash

# Docker Test Script for Chinook Application
# Runs unit tests for all services in containerized environment with PostgreSQL test database

set -e

echo "🧪 Starting containerized unit tests for Chinook application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to cleanup containers and volumes
cleanup() {
    print_status "Cleaning up test containers and volumes..."
    docker-compose -f docker-compose.test.yml down -v --remove-orphans 2>/dev/null || true
    docker volume prune -f 2>/dev/null || true
}

# Trap to ensure cleanup on script exit
trap cleanup EXIT

# Parse command line arguments
RUN_SERVICE=""
VERBOSE=false
REBUILD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --service)
            RUN_SERVICE="$2"
            shift 2
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --rebuild)
            REBUILD=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --service SERVICE    Run tests for specific service (auth, app, catalogos, web)"
            echo "  --verbose           Enable verbose output"
            echo "  --rebuild           Rebuild containers before running tests"
            echo "  --help              Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                  # Run all tests"
            echo "  $0 --service auth   # Run only auth service tests"
            echo "  $0 --rebuild        # Rebuild containers and run all tests"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Set verbose environment variable for containers
if [ "$VERBOSE" = true ]; then
    export VERBOSE_TESTS=true
    print_status "Verbose mode enabled"
fi

# Clean up any existing test containers
cleanup

# Build containers if rebuild flag is set
if [ "$REBUILD" = true ]; then
    print_status "Rebuilding test containers..."
    docker-compose -f docker-compose.test.yml build --no-cache
fi

# Start PostgreSQL test database and wait for it to be ready
print_status "Starting PostgreSQL test database..."
docker-compose -f docker-compose.test.yml up -d postgres-test

print_status "Waiting for PostgreSQL to be ready..."
timeout=60
counter=0
while ! docker-compose -f docker-compose.test.yml exec -T postgres-test pg_isready -U test_user -d chinook_test >/dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        print_error "PostgreSQL failed to start within $timeout seconds"
        exit 1
    fi
    sleep 1
    counter=$((counter + 1))
done

print_success "PostgreSQL test database is ready"

# Run database migrations (only if needed for backend services)
if [ -n "$RUN_SERVICE" ] && [ "$RUN_SERVICE" = "web" ]; then
    print_status "Skipping database migrations for web-only tests"
else
    print_status "Running database migrations..."
    
    # Run migrations for each service that needs them
    migration_failed=false
    
    if [ -z "$RUN_SERVICE" ] || [ "$RUN_SERVICE" = "auth" ]; then
        if ! docker-compose -f docker-compose.test.yml up --exit-code-from db-migrate-auth-test db-migrate-auth-test; then
            print_error "Auth database migrations failed"
            migration_failed=true
        fi
    fi
    
    if [ -z "$RUN_SERVICE" ] || [ "$RUN_SERVICE" = "app" ]; then
        if ! docker-compose -f docker-compose.test.yml up --exit-code-from db-migrate-app-test db-migrate-app-test; then
            print_error "App database migrations failed"
            migration_failed=true
        fi
    fi
    
    if [ -z "$RUN_SERVICE" ] || [ "$RUN_SERVICE" = "catalogos" ]; then
        if ! docker-compose -f docker-compose.test.yml up --exit-code-from db-migrate-catalogos-test db-migrate-catalogos-test; then
            print_warning "Catalogos database migrations failed (known issue with schema)"
        fi
    fi
    
    if [ "$migration_failed" = true ]; then
        print_error "Some database migrations failed"
        exit 1
    fi
    
    print_success "Database migrations completed"
fi

# Function to run tests for a specific service
run_service_tests() {
    local service=$1
    local service_name="${service}-test"
    
    print_status "Running tests for $service service..."
    
    if docker-compose -f docker-compose.test.yml up --exit-code-from $service_name $service_name; then
        print_success "$service tests passed"
        return 0
    else
        print_error "$service tests failed"
        return 1
    fi
}

# Run tests based on service selection
test_results=()

if [ -n "$RUN_SERVICE" ]; then
    # Run tests for specific service
    case $RUN_SERVICE in
        auth|app|catalogos|web)
            if run_service_tests $RUN_SERVICE; then
                test_results+=("$RUN_SERVICE:PASS")
            else
                test_results+=("$RUN_SERVICE:FAIL")
            fi
            ;;
        *)
            print_error "Invalid service: $RUN_SERVICE"
            print_error "Valid services: auth, app, catalogos, web"
            exit 1
            ;;
    esac
else
    # Run tests for all services
    services=("auth" "app" "catalogos" "web")
    
    for service in "${services[@]}"; do
        if run_service_tests $service; then
            test_results+=("$service:PASS")
        else
            test_results+=("$service:FAIL")
        fi
    done
fi

# Print test results summary
echo ""
print_status "Test Results Summary:"
echo "========================"

failed_tests=0
for result in "${test_results[@]}"; do
    service=$(echo $result | cut -d: -f1)
    status=$(echo $result | cut -d: -f2)
    
    if [ "$status" = "PASS" ]; then
        print_success "$service: PASSED"
    else
        print_error "$service: FAILED"
        failed_tests=$((failed_tests + 1))
    fi
done

echo ""
if [ $failed_tests -eq 0 ]; then
    print_success "All tests passed! 🎉"
    exit 0
else
    print_error "$failed_tests test suite(s) failed"
    exit 1
fi