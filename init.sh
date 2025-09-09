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

# Template processing functions
read_template_file() {
    local template_file="$1"
    
    if [[ ! -f "$template_file" ]]; then
        print_error "Template file not found: $template_file"
        return 1
    fi
    
    if [[ ! -r "$template_file" ]]; then
        print_error "Template file is not readable: $template_file"
        return 1
    fi
    
    cat "$template_file"
}

substitute_port_value() {
    local template_content="$1"
    local port="$2"
    
    # Replace PORT= with PORT=<port_value>, handling various formats including empty values
    echo "$template_content" | sed "s/PORT=.*/PORT=$port/"
}

process_microservice_template() {
    local template_file="$1"
    
    if [[ ! -f "$template_file" ]]; then
        print_error "Microservice template file not found: $template_file"
        return 1
    fi
    
    # Read template and substitute dummy values
    local template_content
    template_content=$(cat "$template_file")
    
    # Substitute each variable with dummy values
    template_content=$(echo "$template_content" | sed 's/MAIL_HOST=.*/MAIL_HOST=localhost/')
    template_content=$(echo "$template_content" | sed 's/MAIL_PORT=.*/MAIL_PORT=587/')
    template_content=$(echo "$template_content" | sed 's/MAIL_USER=.*/MAIL_USER=dummy@example.com/')
    template_content=$(echo "$template_content" | sed 's/MAIL_PASSWORD=.*/MAIL_PASSWORD=dummypassword/')
    
    echo "$template_content"
}

check_file_exists() {
    local file_path="$1"
    local service_name="$2"
    
    if [[ -f "$file_path" ]]; then
        print_warning "Environment file already exists for $service_name, skipping creation: $file_path"
        return 0  # File exists
    fi
    
    return 1  # File doesn't exist
}

create_service_env_file() {
    local service="$1"
    local port="$2"
    local service_dir="$service"
    local env_file="$service_dir/.env"
    local template_file=".env.development.example"
    
    # Check if file already exists
    if check_file_exists "$env_file" "$service service"; then
        return 0
    fi
    
    # Read template file
    local template_content
    if ! template_content=$(read_template_file "$template_file"); then
        return 1
    fi
    
    # Substitute PORT value
    local env_content
    env_content=$(substitute_port_value "$template_content" "$port")
    
    # Create service directory if it doesn't exist
    if ! mkdir -p "$service_dir"; then
        print_error "Failed to create directory: $service_dir"
        return 1
    fi
    
    # Write environment file
    if echo "$env_content" > "$env_file"; then
        print_success "Created environment file for $service service (PORT=$port)"
        CREATED_FILES+=("$env_file")
        return 0
    else
        print_error "Failed to create environment file: $env_file"
        return 1
    fi
}

create_microservices_env_file() {
    local microservices_dir="microservices"
    local env_file="$microservices_dir/.env"
    local template_file=".env.microservice.example"
    
    # Check if file already exists
    if check_file_exists "$env_file" "microservices"; then
        return 0
    fi
    
    # Process microservice template
    local env_content
    if ! env_content=$(process_microservice_template "$template_file"); then
        return 1
    fi
    
    # Create microservices directory if it doesn't exist
    if ! mkdir -p "$microservices_dir"; then
        print_error "Failed to create directory: $microservices_dir"
        return 1
    fi
    
    # Write environment file
    if echo "$env_content" > "$env_file"; then
        print_success "Created microservices environment file with dummy values"
        CREATED_FILES+=("$env_file")
        return 0
    else
        print_error "Failed to create microservices environment file: $env_file"
        return 1
    fi
}

# Phase 3: Environment File Generation
create_environment_files() {
    print_phase "Creating Environment Files"
    
    # Create service environment files
    print_step "Creating service environment files..."
    
    local service_creation_errors=0
    
    for service in "${!SERVICES[@]}"; do
        local port="${SERVICES[$service]}"
        
        if ! create_service_env_file "$service" "$port"; then
            ((service_creation_errors++))
        fi
    done
    
    # Create microservices environment file
    print_step "Creating microservices environment file..."
    
    if ! create_microservices_env_file; then
        ((service_creation_errors++))
    fi
    
    # Report summary
    if [[ $service_creation_errors -gt 0 ]]; then
        print_warning "$service_creation_errors environment file(s) could not be created"
    fi
    
    if [[ ${#CREATED_FILES[@]} -gt 0 ]]; then
        print_success "Environment file creation phase completed"
    else
        print_warning "No new environment files were created (all files already exist or errors occurred)"
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