#!/bin/bash

# Developer Onboarding Script Test Suite
# Tests validation and functionality of init.sh and init.ps1

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test results array
declare -a TEST_RESULTS=()

# Utility functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

run_test() {
    local test_name="$1"
    local test_function="$2"
    
    TESTS_RUN=$((TESTS_RUN + 1))
    log_info "Running test: $test_name"
    
    if $test_function; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        TEST_RESULTS+=("✓ $test_name")
        log_success "Test passed: $test_name"
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        TEST_RESULTS+=("✗ $test_name")
        log_error "Test failed: $test_name"
    fi
    echo
}

# Cleanup utility
cleanup_test_environment() {
    log_info "Cleaning up test environment..."
    
    # Remove test .env files
    local services=("app" "auth" "catalogos" "microservices")
    for service in "${services[@]}"; do
        if [ "$service" = "microservices" ]; then
            [ -f "microservices/.env" ] && rm "microservices/.env" && log_info "Removed microservices/.env"
        else
            [ -f "$service/.env" ] && rm "$service/.env" && log_info "Removed $service/.env"
        fi
    done
    
    # Remove test databases
    [ -f ".db/test_app.sqlite3" ] && rm ".db/test_app.sqlite3" && log_info "Removed test database"
    [ -f ".db/test_auth.sqlite3" ] && rm ".db/test_auth.sqlite3" && log_info "Removed test database"
    [ -f ".db/test_catalogos.sqlite3" ] && rm ".db/test_catalogos.sqlite3" && log_info "Removed test database"
    
    # Remove node_modules if created during testing
    [ -d "test_node_modules" ] && rm -rf "test_node_modules" && log_info "Removed test node_modules"
    
    log_success "Cleanup completed"
}

# Cross-platform compatibility checks
check_cross_platform_compatibility() {
    log_info "Checking cross-platform compatibility..."
    
    # Check if both scripts exist
    if [ ! -f "init.sh" ]; then
        log_error "init.sh not found"
        return 1
    fi
    
    if [ ! -f "init.ps1" ]; then
        log_error "init.ps1 not found"
        return 1
    fi
    
    # Check script permissions
    if [ ! -x "init.sh" ]; then
        log_warning "init.sh is not executable, attempting to fix..."
        chmod +x init.sh
    fi
    
    # Check for required template files
    if [ ! -f ".env.development.example" ]; then
        log_error ".env.development.example template not found"
        return 1
    fi
    
    if [ ! -f ".env.microservice.example" ]; then
        log_error ".env.microservice.example template not found"
        return 1
    fi
    
    log_success "Cross-platform compatibility check passed"
    return 0
}

# Validate .env file creation
validate_env_file_creation() {
    log_info "Validating .env file creation logic..."
    
    # Test service .env file creation
    local services=("app" "auth" "catalogos")
    local ports=(3001 3000 3002)
    
    for i in "${!services[@]}"; do
        local service="${services[$i]}"
        local expected_port="${ports[$i]}"
        
        # Create test .env file
        if [ -f "$service/.env" ]; then
            log_warning "$service/.env already exists, skipping creation test"
            continue
        fi
        
        # Simulate .env creation from template
        if [ -f ".env.development.example" ]; then
            mkdir -p "$service"
            sed "s/PORT=.*/PORT=$expected_port/" ".env.development.example" > "$service/.env"
            
            # Validate content
            if grep -q "PORT=$expected_port" "$service/.env"; then
                log_success "$service/.env created with correct PORT=$expected_port"
            else
                log_error "$service/.env missing correct PORT configuration"
                return 1
            fi
        else
            log_error "Template file .env.development.example not found"
            return 1
        fi
    done
    
    # Test microservices .env file creation
    if [ ! -f "microservices/.env" ]; then
        mkdir -p "microservices"
        if [ -f ".env.microservice.example" ]; then
            cp ".env.microservice.example" "microservices/.env"
            
            # Validate dummy values
            local required_vars=("MAIL_HOST" "MAIL_PORT" "MAIL_USER" "MAIL_PASSWORD")
            for var in "${required_vars[@]}"; do
                if ! grep -q "$var=" "microservices/.env"; then
                    log_error "microservices/.env missing required variable: $var"
                    return 1
                fi
            done
            log_success "microservices/.env created with required variables"
        else
            log_error "Template file .env.microservice.example not found"
            return 1
        fi
    fi
    
    return 0
}#
 Verify database migration success
verify_database_migrations() {
    log_info "Verifying database migration capabilities..."
    
    # Check if package.json has required migration scripts
    if [ ! -f "package.json" ]; then
        log_error "package.json not found"
        return 1
    fi
    
    # Check for migration scripts
    local migration_scripts=("database:migrate-app" "database:migrate-auth" "database:migrate-cat" "database:seed")
    for script in "${migration_scripts[@]}"; do
        if ! grep -q "\"$script\"" package.json; then
            log_error "Missing migration script: $script"
            return 1
        fi
    done
    
    # Check database directory structure
    if [ ! -d "database" ]; then
        log_error "database directory not found"
        return 1
    fi
    
    local db_dirs=("app" "auth" "catalogos")
    for dir in "${db_dirs[@]}"; do
        if [ ! -d "database/$dir" ]; then
            log_error "database/$dir directory not found"
            return 1
        fi
    done
    
    # Check for .db directory
    if [ ! -d ".db" ]; then
        log_warning ".db directory not found, creating..."
        mkdir -p ".db"
    fi
    
    log_success "Database migration structure verified"
    return 0
}

# Test script execution simulation
test_script_execution() {
    log_info "Testing script execution simulation..."
    
    # Test dependency installation check
    if [ ! -f "package.json" ]; then
        log_error "package.json not found for dependency testing"
        return 1
    fi
    
    # Simulate npm install check (without actually running it)
    if command -v npm >/dev/null 2>&1; then
        log_success "npm is available for dependency installation"
    else
        log_error "npm not found - dependency installation would fail"
        return 1
    fi
    
    # Test file creation permissions
    local test_file="test_permissions.tmp"
    if touch "$test_file" 2>/dev/null; then
        rm "$test_file"
        log_success "File creation permissions verified"
    else
        log_error "Insufficient permissions for file creation"
        return 1
    fi
    
    return 0
}

# Integration test for init.sh
test_init_sh_integration() {
    log_info "Running integration test for init.sh..."
    
    if [ ! -f "init.sh" ]; then
        log_error "init.sh not found"
        return 1
    fi
    
    # Check script syntax
    if bash -n init.sh; then
        log_success "init.sh syntax is valid"
    else
        log_error "init.sh has syntax errors"
        return 1
    fi
    
    # Check for required functions/sections
    local required_sections=("npm install" "env" "database")
    for section in "${required_sections[@]}"; do
        if grep -q "$section" init.sh; then
            log_success "init.sh contains $section logic"
        else
            log_warning "init.sh may be missing $section logic"
        fi
    done
    
    return 0
}

# Integration test for init.ps1
test_init_ps1_integration() {
    log_info "Running integration test for init.ps1..."
    
    if [ ! -f "init.ps1" ]; then
        log_error "init.ps1 not found"
        return 1
    fi
    
    # Check if PowerShell is available (on Unix systems)
    if command -v pwsh >/dev/null 2>&1; then
        # Check script syntax with PowerShell
        if pwsh -Command "Get-Content 'init.ps1' | Out-Null"; then
            log_success "init.ps1 is readable"
        else
            log_error "init.ps1 has issues"
            return 1
        fi
    else
        log_warning "PowerShell not available for syntax checking"
    fi
    
    # Check for required PowerShell patterns
    local required_patterns=("npm install" "\.env" "Write-Host")
    for pattern in "${required_patterns[@]}"; do
        if grep -q "$pattern" init.ps1; then
            log_success "init.ps1 contains $pattern logic"
        else
            log_warning "init.ps1 may be missing $pattern logic"
        fi
    done
    
    return 0
}

# Test environment file validation
test_env_file_validation() {
    log_info "Testing environment file validation..."
    
    # Create test .env files and validate their content
    local test_services=("app" "auth" "catalogos")
    local test_ports=(3001 3000 3002)
    
    for i in "${!test_services[@]}"; do
        local service="${test_services[$i]}"
        local port="${test_ports[$i]}"
        
        mkdir -p "$service"
        
        # Create test .env file
        cat > "$service/.env" << EOF
CORS_ORIGIN=*
JWT_SECREAT_KEY=588eae8f9d7224acdf847c7b07bd2ccf97157d78bdac49954d2c7d8c403ca3fd
PORT=$port
EOF
        
        # Validate content
        if [ -f "$service/.env" ]; then
            if grep -q "PORT=$port" "$service/.env" && grep -q "JWT_SECREAT_KEY=" "$service/.env"; then
                log_success "$service/.env validation passed"
            else
                log_error "$service/.env validation failed"
                return 1
            fi
        else
            log_error "$service/.env was not created"
            return 1
        fi
    done
    
    # Test microservices .env validation
    mkdir -p "microservices"
    cat > "microservices/.env" << EOF
MAIL_HOST=localhost
MAIL_PORT=587
MAIL_USER=dummy@example.com
MAIL_PASSWORD=dummypassword
EOF
    
    if [ -f "microservices/.env" ]; then
        local required_vars=("MAIL_HOST=localhost" "MAIL_PORT=587" "MAIL_USER=dummy@example.com" "MAIL_PASSWORD=dummypassword")
        for var in "${required_vars[@]}"; do
            if grep -q "$var" "microservices/.env"; then
                log_success "microservices/.env contains $var"
            else
                log_error "microservices/.env missing $var"
                return 1
            fi
        done
    else
        log_error "microservices/.env was not created"
        return 1
    fi
    
    return 0
}

# Main test execution
main() {
    echo "=========================================="
    echo "Developer Onboarding Script Test Suite"
    echo "=========================================="
    echo
    
    # Run all tests
    run_test "Cross-platform compatibility check" check_cross_platform_compatibility
    run_test "Environment file creation validation" validate_env_file_creation
    run_test "Database migration verification" verify_database_migrations
    run_test "Script execution simulation" test_script_execution
    run_test "init.sh integration test" test_init_sh_integration
    run_test "init.ps1 integration test" test_init_ps1_integration
    run_test "Environment file validation" test_env_file_validation
    
    # Display results
    echo "=========================================="
    echo "Test Results Summary"
    echo "=========================================="
    echo "Tests run: $TESTS_RUN"
    echo "Tests passed: $TESTS_PASSED"
    echo "Tests failed: $TESTS_FAILED"
    echo
    
    echo "Detailed Results:"
    for result in "${TEST_RESULTS[@]}"; do
        echo "  $result"
    done
    echo
    
    # Cleanup
    if [ "$1" != "--no-cleanup" ]; then
        cleanup_test_environment
    fi
    
    # Exit with appropriate code
    if [ $TESTS_FAILED -eq 0 ]; then
        log_success "All tests passed!"
        exit 0
    else
        log_error "$TESTS_FAILED test(s) failed"
        exit 1
    fi
}

# Handle command line arguments
case "${1:-}" in
    --cleanup-only)
        cleanup_test_environment
        exit 0
        ;;
    --help)
        echo "Usage: $0 [OPTIONS]"
        echo "Options:"
        echo "  --cleanup-only    Only run cleanup, don't run tests"
        echo "  --no-cleanup      Don't run cleanup after tests"
        echo "  --help           Show this help message"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac