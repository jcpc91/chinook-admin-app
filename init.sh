#!/bin/bash

# Developer Onboarding Script for Chinook Music Database Administration Application
# This script automates the complete setup process for new developers

set -e  # Exit on any error

# Color codes for output formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Global variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ERRORS=()
WARNINGS=()
CREATED_FILES=()

# Service configuration
declare -A SERVICES=(
    ["auth"]="3000"
    ["app"]="3001" 
    ["catalogos"]="3002"
)

# Progress reporting functions
print_header() {
    echo -e "\n${BLUE}================================================${NC}"
    echo -e "${BLUE}  Chinook Developer Environment Setup${NC}"
    echo -e "${BLUE}================================================${NC}\n"
}

print_phase() {
    echo -e "\n${BLUE}[PHASE]${NC} $1"
    echo -e "${BLUE}----------------------------------------${NC}"
}

print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    WARNINGS+=("$1")
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    ERRORS+=("$1")
}

# Error handling function
handle_error() {
    local exit_code=$?
    local line_number=$1
    print_error "Script failed at line $line_number with exit code $exit_code"
    print_error "Last command: $BASH_COMMAND"
    
    echo -e "\n${RED}Setup failed. Please check the errors above and try again.${NC}"
    echo -e "${YELLOW}For troubleshooting help, please refer to the project documentation.${NC}"
    exit $exit_code
}

# Set up error trap
trap 'handle_error $LINENO' ERR

# Phase 1: Initialization
initialize_setup() {
    print_phase "Initializing Setup"
    
    print_step "Checking prerequisites..."
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install Node.js and npm first."
        exit 1
    fi
    
    # Check if we're in the correct directory
    if [[ ! -f "package.json" ]]; then
        print_error "package.json not found. Please run this script from the project root directory."
        exit 1
    fi
    
    print_success "Prerequisites check completed"
    
    echo -e "\nThis script will:"
    echo -e "  • Install all project dependencies"
    echo -e "  • Create environment files for all services"
    echo -e "  • Set up microservices configuration"
    echo -e "  • Initialize database with migrations and seed data"
    echo -e "  • Provide you with next steps to start development\n"
}

# Phase 2: Dependency Installation
install_dependencies() {
    print_phase "Installing Dependencies"
    
    print_step "Installing root-level dependencies..."
    
    if npm install; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        print_error "Try running 'npm install --verbose' for more details"
        exit 1
    fi
}

# Phase 3: Environment File Generation
create_environment_files() {
    print_phase "Creating Environment Files"
    
    # Create service environment files
    print_step "Creating service environment files..."
    
    for service in "${!SERVICES[@]}"; do
        local service_dir="$service"
        local env_file="$service_dir/.env"
        local port="${SERVICES[$service]}"
        
        if [[ -f "$env_file" ]]; then
            print_warning "Environment file already exists for $service service, skipping: $env_file"
            continue
        fi
        
        if [[ ! -f ".env.development.example" ]]; then
            print_error "Template file .env.development.example not found"
            continue
        fi
        
        # Create service directory if it doesn't exist
        mkdir -p "$service_dir"
        
        # Create .env file from template with assigned port
        sed "s/PORT=/PORT=$port/" ".env.development.example" > "$env_file"
        
        print_success "Created environment file for $service service (PORT=$port)"
        CREATED_FILES+=("$env_file")
    done
    
    # Create microservices environment file
    print_step "Creating microservices environment file..."
    
    local microservices_env="microservices/.env"
    
    if [[ -f "$microservices_env" ]]; then
        print_warning "Microservices environment file already exists, skipping: $microservices_env"
    else
        if [[ ! -f ".env.microservice.example" ]]; then
            print_error "Template file .env.microservice.example not found"
        else
            # Create microservices directory if it doesn't exist
            mkdir -p "microservices"
            
            # Create .env file with dummy values
            cat > "$microservices_env" << EOF
MAIL_HOST=localhost
MAIL_PORT=587
MAIL_USER=dummy@example.com
MAIL_PASSWORD=dummypassword
EOF
            
            print_success "Created microservices environment file with dummy values"
            CREATED_FILES+=("$microservices_env")
        fi
    fi
}

# Phase 4: Database Setup
setup_database() {
    print_phase "Setting Up Database"
    
    print_step "Running database migrations..."
    
    # Database migration commands
    local migrations=(
        "database:migrate-app"
        "database:migrate-auth" 
        "database:migrate-cat"
    )
    
    local migration_results=()
    
    for migration in "${migrations[@]}"; do
        print_step "Executing $migration..."
        
        if npm run "$migration"; then
            print_success "Migration $migration completed successfully"
            migration_results+=("$migration: SUCCESS")
        else
            print_error "Migration $migration failed"
            migration_results+=("$migration: FAILED")
            # Continue with other migrations instead of exiting
        fi
    done
    
    # Run database seeding
    print_step "Seeding database with initial data..."
    
    if npm run "database:seed"; then
        print_success "Database seeding completed successfully"
        migration_results+=("database:seed: SUCCESS")
    else
        print_error "Database seeding failed"
        migration_results+=("database:seed: FAILED")
    fi
    
    # Display migration summary
    echo -e "\n${BLUE}Migration Summary:${NC}"
    for result in "${migration_results[@]}"; do
        if [[ $result == *"SUCCESS"* ]]; then
            echo -e "  ${GREEN}✓${NC} $result"
        else
            echo -e "  ${RED}✗${NC} $result"
        fi
    done
}

# Phase 5: Completion and Summary
complete_setup() {
    print_phase "Setup Complete"
    
    # Display summary
    echo -e "\n${GREEN}🎉 Developer environment setup completed!${NC}\n"
    
    if [[ ${#CREATED_FILES[@]} -gt 0 ]]; then
        echo -e "${BLUE}Created Files:${NC}"
        for file in "${CREATED_FILES[@]}"; do
            echo -e "  • $file"
        done
        echo ""
    fi
    
    if [[ ${#WARNINGS[@]} -gt 0 ]]; then
        echo -e "${YELLOW}Warnings:${NC}"
        for warning in "${WARNINGS[@]}"; do
            echo -e "  • $warning"
        done
        echo ""
    fi
    
    if [[ ${#ERRORS[@]} -gt 0 ]]; then
        echo -e "${RED}Errors encountered:${NC}"
        for error in "${ERRORS[@]}"; do
            echo -e "  • $error"
        done
        echo ""
    fi
    
    # Display next steps
    echo -e "${BLUE}Next Steps:${NC}"
    echo -e "  1. Start the development environment:"
    echo -e "     ${GREEN}./run.sh${NC}"
    echo -e ""
    echo -e "  2. Or start services individually:"
    echo -e "     ${GREEN}npm run app:dev${NC}     # Start main app service (port 3001)"
    echo -e "     ${GREEN}npm run auth:dev${NC}    # Start auth service (port 3000)"
    echo -e "     ${GREEN}npm run cat:dev${NC}     # Start catalog service (port 3002)"
    echo -e "     ${GREEN}npm run web:dev${NC}     # Start web frontend"
    echo -e ""
    echo -e "  3. Access the application:"
    echo -e "     • Frontend: http://localhost:5173 (or as shown by Vite)"
    echo -e "     • Auth API: http://localhost:3000"
    echo -e "     • App API: http://localhost:3001"
    echo -e "     • Catalog API: http://localhost:3002"
    echo -e ""
    echo -e "${GREEN}Happy coding! 🚀${NC}"
}

# Main execution flow
main() {
    print_header
    
    initialize_setup
    install_dependencies
    create_environment_files
    setup_database
    complete_setup
}

# Execute main function
main "$@"