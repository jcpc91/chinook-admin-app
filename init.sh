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
    local phase_num="$2"
    local total_phases="5"
    echo -e "\n${BLUE}[PHASE $phase_num/$total_phases]${NC} $1"
    echo -e "${BLUE}----------------------------------------${NC}"
}

print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_substep() {
    echo -e "  ${GREEN}→${NC} $1"
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

print_troubleshooting() {
    echo -e "${YELLOW}[TROUBLESHOOTING]${NC} $1"
}

# Error handling function
handle_error() {
    local exit_code=$?
    local line_number=$1
    print_error "Script failed at line $line_number with exit code $exit_code"
    print_error "Last command: $BASH_COMMAND"
    
    echo -e "\n${RED}Setup failed. Please check the errors above and try again.${NC}"
    
    # Provide specific troubleshooting guidance
    echo -e "\n${YELLOW}Troubleshooting Tips:${NC}"
    echo -e "  • Check if you have proper file permissions in this directory"
    echo -e "  • Ensure you're running the script from the project root directory"
    echo -e "  • Verify that npm and Node.js are properly installed"
    echo -e "  • Try running individual commands manually to identify the issue"
    echo -e "  • Check if any antivirus software is blocking file operations"
    echo -e "  • On Linux/macOS, you may need to run: chmod +x init.sh"
    echo -e "  • For permission issues, try running with appropriate privileges"
    
    exit $exit_code
}

# Platform-specific error handling
handle_permission_error() {
    local file_path="$1"
    local operation="$2"
    
    print_error "Permission denied while trying to $operation: $file_path"
    print_troubleshooting "File permission issue detected"
    
    if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
        echo -e "  • Try running: ${GREEN}sudo chmod 755 $(dirname "$file_path")${NC}"
        echo -e "  • Or change ownership: ${GREEN}sudo chown -R \$USER:$(id -gn) .${NC}"
        echo -e "  • Check directory permissions: ${GREEN}ls -la $(dirname "$file_path")${NC}"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        echo -e "  • Try running Git Bash or Command Prompt as Administrator"
        echo -e "  • Check if the directory is read-only in Windows Explorer"
        echo -e "  • Disable any antivirus real-time protection temporarily"
    fi
}

# Network/dependency error handling
handle_dependency_error() {
    local error_type="$1"
    
    print_error "Dependency installation failed: $error_type"
    print_troubleshooting "Dependency installation issue detected"
    
    echo -e "  • Check your internet connection"
    echo -e "  • Try clearing npm cache: ${GREEN}npm cache clean --force${NC}"
    echo -e "  • Try using a different npm registry: ${GREEN}npm install --registry https://registry.npmjs.org/${NC}"
    echo -e "  • Check if you're behind a corporate firewall or proxy"
    echo -e "  • Verify Node.js version compatibility: ${GREEN}node --version${NC}"
    echo -e "  • Try deleting node_modules and package-lock.json, then retry"
    echo -e "  • Run with verbose logging: ${GREEN}npm install --verbose${NC}"
}

# Set up error trap
trap 'handle_error $LINENO' ERR

# Phase 1: Initialization
initialize_setup() {
    print_phase "Initializing Setup" "1"
    
    print_step "Checking prerequisites..."
    
    # Check if npm is installed
    print_substep "Verifying npm installation..."
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install Node.js and npm first."
        print_troubleshooting "npm not found in PATH"
        echo -e "  • Download Node.js from: ${GREEN}https://nodejs.org/${NC}"
        echo -e "  • Or use a package manager:"
        echo -e "    - Ubuntu/Debian: ${GREEN}sudo apt install nodejs npm${NC}"
        echo -e "    - macOS: ${GREEN}brew install node${NC}"
        echo -e "    - Windows: Download from nodejs.org or use chocolatey"
        exit 1
    fi
    echo -e "    ✓ npm found (version: $(npm --version))"
    
    # Check Node.js version
    print_substep "Checking Node.js version..."
    local node_version=$(node --version 2>/dev/null || echo "unknown")
    echo -e "    ✓ Node.js version: $node_version"
    
    # Check if we're in the correct directory
    print_substep "Verifying project structure..."
    if [[ ! -f "package.json" ]]; then
        print_error "package.json not found. Please run this script from the project root directory."
        print_troubleshooting "Incorrect working directory"
        echo -e "  • Current directory: ${GREEN}$(pwd)${NC}"
        echo -e "  • Navigate to the project root where package.json is located"
        echo -e "  • Use: ${GREEN}cd /path/to/chinook-project${NC}"
        exit 1
    fi
    echo -e "    ✓ package.json found"
    
    # Check for required template files
    print_substep "Checking required template files..."
    local missing_files=()
    
    if [[ ! -f ".env.development.example" ]]; then
        missing_files+=(".env.development.example")
    else
        echo -e "    ✓ .env.development.example found"
    fi
    
    if [[ ! -f ".env.microservice.example" ]]; then
        missing_files+=(".env.microservice.example")
    else
        echo -e "    ✓ .env.microservice.example found"
    fi
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        print_error "Required template files are missing:"
        for file in "${missing_files[@]}"; do
            echo -e "  • $file"
        done
        print_troubleshooting "Missing template files"
        echo -e "  • Ensure you have cloned the complete repository"
        echo -e "  • Check if files were excluded by .gitignore"
        echo -e "  • Verify the repository integrity"
        exit 1
    fi
    
    # Check write permissions
    print_substep "Checking write permissions..."
    if ! touch .permission_test 2>/dev/null; then
        handle_permission_error "$(pwd)" "write to directory"
        exit 1
    else
        rm -f .permission_test
        echo -e "    ✓ Write permissions confirmed"
    fi
    
    print_success "Prerequisites check completed successfully"
    
    echo -e "\n${BLUE}Setup Overview:${NC}"
    echo -e "This script will perform the following operations:"
    echo -e "  ${GREEN}1.${NC} Install all project dependencies (~2-5 minutes)"
    echo -e "  ${GREEN}2.${NC} Create environment files for all services"
    echo -e "  ${GREEN}3.${NC} Set up microservices configuration"
    echo -e "  ${GREEN}4.${NC} Initialize database with migrations and seed data"
    echo -e "  ${GREEN}5.${NC} Provide you with next steps to start development"
    echo -e "\n${YELLOW}Estimated total time: 3-7 minutes${NC}\n"
}

# Phase 2: Dependency Installation
install_dependencies() {
    print_phase "Installing Dependencies" "2"
    
    print_step "Installing root-level dependencies..."
    print_substep "This may take a few minutes depending on your internet connection..."
    
    # Show progress indicator
    echo -e "  ${BLUE}Running npm install...${NC}"
    
    # Capture both stdout and stderr
    local npm_output
    local npm_exit_code
    
    if npm_output=$(npm install 2>&1); then
        npm_exit_code=0
    else
        npm_exit_code=$?
    fi
    
    if [[ $npm_exit_code -eq 0 ]]; then
        print_success "Dependencies installed successfully"
        
        # Show summary of installed packages
        local package_count=$(echo "$npm_output" | grep -c "added\|updated\|removed" 2>/dev/null || echo "0")
        if [[ $package_count -gt 0 ]]; then
            echo -e "  ${GREEN}→${NC} Package operations completed"
        fi
        
        # Check for any warnings
        if echo "$npm_output" | grep -q "WARN" 2>/dev/null; then
            print_warning "npm install completed with warnings (this is usually normal)"
            echo -e "  ${YELLOW}→${NC} Check npm output above for details"
        fi
    else
        print_error "Failed to install dependencies (exit code: $npm_exit_code)"
        
        # Analyze the error and provide specific guidance
        if echo "$npm_output" | grep -q "EACCES\|permission denied" 2>/dev/null; then
            handle_permission_error "node_modules" "install dependencies"
        elif echo "$npm_output" | grep -q "ENOTFOUND\|network\|timeout" 2>/dev/null; then
            handle_dependency_error "network"
        elif echo "$npm_output" | grep -q "ENOSPC" 2>/dev/null; then
            print_troubleshooting "Insufficient disk space"
            echo -e "  • Free up disk space and try again"
            echo -e "  • Check available space: ${GREEN}df -h${NC}"
        else
            handle_dependency_error "unknown"
        fi
        
        # Show the actual npm error output
        echo -e "\n${RED}npm output:${NC}"
        echo "$npm_output" | tail -20
        
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
    
    print_substep "Processing $service service (PORT=$port)..."
    
    # Check if file already exists
    if check_file_exists "$env_file" "$service service"; then
        return 0
    fi
    
    # Read template file
    local template_content
    if ! template_content=$(read_template_file "$template_file"); then
        print_error "Failed to read template file for $service service"
        print_troubleshooting "Template file issue"
        echo -e "  • Verify $template_file exists and is readable"
        echo -e "  • Check file permissions: ${GREEN}ls -la $template_file${NC}"
        return 1
    fi
    
    # Substitute PORT value
    local env_content
    env_content=$(substitute_port_value "$template_content" "$port")
    
    # Create service directory if it doesn't exist
    if ! mkdir -p "$service_dir" 2>/dev/null; then
        handle_permission_error "$service_dir" "create directory"
        return 1
    fi
    
    # Write environment file with error handling
    if echo "$env_content" > "$env_file" 2>/dev/null; then
        print_success "Created environment file for $service service (PORT=$port)"
        CREATED_FILES+=("$env_file")
        echo -e "    ✓ File: $env_file"
        return 0
    else
        if [[ ! -w "$(dirname "$env_file")" ]]; then
            handle_permission_error "$env_file" "create file"
        else
            print_error "Failed to create environment file: $env_file"
            print_troubleshooting "File creation failed"
            echo -e "  • Check available disk space: ${GREEN}df -h${NC}"
            echo -e "  • Verify directory exists: ${GREEN}ls -la $(dirname "$env_file")${NC}"
        fi
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
    print_phase "Creating Environment Files" "3"
    
    # Create service environment files
    print_step "Creating service environment files..."
    
    local service_creation_errors=0
    local services_processed=0
    local services_created=0
    local services_skipped=0
    
    for service in "${!SERVICES[@]}"; do
        local port="${SERVICES[$service]}"
        ((services_processed++))
        
        if create_service_env_file "$service" "$port"; then
            if [[ ! -f "$service/.env" ]] || [[ "${CREATED_FILES[*]}" =~ "$service/.env" ]]; then
                ((services_created++))
            else
                ((services_skipped++))
            fi
        else
            ((service_creation_errors++))
        fi
    done
    
    # Create microservices environment file
    print_step "Creating microservices environment file..."
    print_substep "Setting up microservices with dummy mail configuration..."
    
    if create_microservices_env_file; then
        if [[ "${CREATED_FILES[*]}" =~ "microservices/.env" ]]; then
            ((services_created++))
        else
            ((services_skipped++))
        fi
    else
        ((service_creation_errors++))
    fi
    
    # Report detailed summary
    echo -e "\n${BLUE}Environment File Summary:${NC}"
    echo -e "  • Services processed: $services_processed"
    echo -e "  • Files created: $services_created"
    echo -e "  • Files skipped (already exist): $services_skipped"
    echo -e "  • Errors encountered: $service_creation_errors"
    
    if [[ $service_creation_errors -gt 0 ]]; then
        print_warning "$service_creation_errors environment file(s) could not be created"
        print_troubleshooting "Some environment files failed to create"
        echo -e "  • You may need to create these files manually"
        echo -e "  • Check the error messages above for specific guidance"
        echo -e "  • The setup can continue, but affected services may not start properly"
    fi
    
    if [[ ${#CREATED_FILES[@]} -gt 0 ]]; then
        print_success "Environment file creation phase completed"
        echo -e "  ${GREEN}→${NC} Created ${#CREATED_FILES[@]} new environment file(s)"
    else
        if [[ $services_skipped -gt 0 ]]; then
            print_success "Environment file phase completed (all files already existed)"
        else
            print_warning "No new environment files were created due to errors"
        fi
    fi
}

# Phase 4: Database Setup
setup_database() {
    print_phase "Setting Up Database" "4"
    
    print_step "Initializing database schema and data..."
    print_substep "This will create SQLite databases and populate them with initial data..."
    
    # Database migration commands
    local migrations=(
        "database:migrate-app"
        "database:migrate-auth" 
        "database:migrate-cat"
    )
    
    local migration_results=()
    local successful_migrations=0
    local failed_migrations=0
    
    # Check if database directory exists
    if [[ ! -d "database" ]]; then
        print_error "Database directory not found"
        print_troubleshooting "Missing database directory"
        echo -e "  • Ensure you have cloned the complete repository"
        echo -e "  • Check if 'database' directory exists in project root"
        return 1
    fi
    
    for migration in "${migrations[@]}"; do
        print_substep "Executing $migration..."
        
        # Capture migration output for better error reporting
        local migration_output
        local migration_exit_code
        
        if migration_output=$(npm run "$migration" 2>&1); then
            migration_exit_code=0
        else
            migration_exit_code=$?
        fi
        
        if [[ $migration_exit_code -eq 0 ]]; then
            print_success "Migration $migration completed successfully"
            migration_results+=("$migration: SUCCESS")
            ((successful_migrations++))
            echo -e "    ✓ Database schema updated"
        else
            print_error "Migration $migration failed (exit code: $migration_exit_code)"
            migration_results+=("$migration: FAILED")
            ((failed_migrations++))
            
            # Provide specific troubleshooting for database issues
            if echo "$migration_output" | grep -q "ENOENT\|not found" 2>/dev/null; then
                print_troubleshooting "Migration script not found"
                echo -e "  • Check if package.json contains the script: ${GREEN}npm run${NC}"
                echo -e "  • Verify database directory structure"
            elif echo "$migration_output" | grep -q "SQLITE_\|database" 2>/dev/null; then
                print_troubleshooting "Database error detected"
                echo -e "  • Check if .db directory exists and is writable"
                echo -e "  • Verify SQLite is available: ${GREEN}sqlite3 --version${NC}"
                echo -e "  • Check database file permissions"
            else
                print_troubleshooting "Migration execution failed"
                echo -e "  • Check the migration output above for details"
                echo -e "  • Verify all dependencies are installed"
            fi
            
            # Show last few lines of error output
            echo -e "    ${RED}Error details:${NC}"
            echo "$migration_output" | tail -5 | sed 's/^/    /'
            
            # Continue with other migrations instead of exiting
            print_warning "Continuing with remaining migrations..."
        fi
    done
    
    # Run database seeding
    print_step "Seeding database with initial data..."
    print_substep "Populating databases with sample data..."
    
    local seed_output
    local seed_exit_code
    
    if seed_output=$(npm run "database:seed" 2>&1); then
        seed_exit_code=0
    else
        seed_exit_code=$?
    fi
    
    if [[ $seed_exit_code -eq 0 ]]; then
        print_success "Database seeding completed successfully"
        migration_results+=("database:seed: SUCCESS")
        echo -e "    ✓ Sample data loaded"
    else
        print_error "Database seeding failed (exit code: $seed_exit_code)"
        migration_results+=("database:seed: FAILED")
        
        print_troubleshooting "Database seeding failed"
        echo -e "  • This is often non-critical - the application may still work"
        echo -e "  • Check if migrations completed successfully first"
        echo -e "  • You can manually run: ${GREEN}npm run database:seed${NC}"
        echo -e "  • Or populate data through the application interface"
        
        # Show error details
        echo -e "    ${RED}Seed error details:${NC}"
        echo "$seed_output" | tail -5 | sed 's/^/    /'
    fi
    
    # Display comprehensive migration summary
    echo -e "\n${BLUE}Database Setup Summary:${NC}"
    echo -e "  • Successful migrations: $successful_migrations"
    echo -e "  • Failed migrations: $failed_migrations"
    echo -e "  • Total operations: $((${#migrations[@]} + 1))"
    
    echo -e "\n${BLUE}Detailed Results:${NC}"
    for result in "${migration_results[@]}"; do
        if [[ $result == *"SUCCESS"* ]]; then
            echo -e "  ${GREEN}✓${NC} $result"
        else
            echo -e "  ${RED}✗${NC} $result"
        fi
    done
    
    # Provide guidance based on results
    if [[ $failed_migrations -eq 0 ]]; then
        print_success "All database operations completed successfully"
    elif [[ $successful_migrations -gt 0 ]]; then
        print_warning "Database setup completed with some failures"
        echo -e "  ${YELLOW}→${NC} Some services may not function properly"
        echo -e "  ${YELLOW}→${NC} Check error messages above and consider manual intervention"
    else
        print_error "All database operations failed"
        echo -e "  ${RED}→${NC} The application may not start properly"
        echo -e "  ${RED}→${NC} Review error messages and fix issues before proceeding"
    fi
}

# Phase 5: Completion and Summary
complete_setup() {
    print_phase "Setup Complete" "5"
    
    # Calculate setup success rate
    local total_operations=4  # dependencies, env files, database, completion
    local successful_operations=0
    local critical_errors=0
    
    # Check if dependencies were installed (no errors in that phase means success)
    if [[ ${#ERRORS[@]} -eq 0 ]] || ! printf '%s\n' "${ERRORS[@]}" | grep -q "Failed to install dependencies"; then
        ((successful_operations++))
    else
        ((critical_errors++))
    fi
    
    # Check if any environment files were created or already existed
    if [[ ${#CREATED_FILES[@]} -gt 0 ]] || printf '%s\n' "${WARNINGS[@]}" | grep -q "already exists"; then
        ((successful_operations++))
    fi
    
    # Check if any database operations succeeded
    if ! printf '%s\n' "${ERRORS[@]}" | grep -q "All database operations failed"; then
        ((successful_operations++))
    fi
    
    # Completion phase is always successful if we reach here
    ((successful_operations++))
    
    # Display setup status
    local success_rate=$((successful_operations * 100 / total_operations))
    
    if [[ $success_rate -eq 100 ]] && [[ ${#ERRORS[@]} -eq 0 ]]; then
        echo -e "\n${GREEN}🎉 Developer environment setup completed successfully!${NC}"
        echo -e "${GREEN}   All operations completed without errors${NC}\n"
    elif [[ $success_rate -ge 75 ]]; then
        echo -e "\n${YELLOW}⚠️  Developer environment setup completed with warnings${NC}"
        echo -e "${YELLOW}   Setup success rate: $success_rate%${NC}\n"
    else
        echo -e "\n${RED}❌ Developer environment setup completed with significant issues${NC}"
        echo -e "${RED}   Setup success rate: $success_rate%${NC}\n"
    fi
    
    # Detailed summary sections
    if [[ ${#CREATED_FILES[@]} -gt 0 ]]; then
        echo -e "${BLUE}✅ Successfully Created Files:${NC}"
        for file in "${CREATED_FILES[@]}"; do
            echo -e "  ${GREEN}•${NC} $file"
        done
        echo ""
    fi
    
    if [[ ${#WARNINGS[@]} -gt 0 ]]; then
        echo -e "${YELLOW}⚠️  Warnings (Non-Critical Issues):${NC}"
        for warning in "${WARNINGS[@]}"; do
            echo -e "  ${YELLOW}•${NC} $warning"
        done
        echo ""
    fi
    
    if [[ ${#ERRORS[@]} -gt 0 ]]; then
        echo -e "${RED}❌ Errors Encountered:${NC}"
        for error in "${ERRORS[@]}"; do
            echo -e "  ${RED}•${NC} $error"
        done
        echo -e "\n${YELLOW}💡 Recommendation:${NC} Review errors above and consider manual fixes"
        echo ""
    fi
    
    # Environment status check
    echo -e "${BLUE}🔧 Environment Status Check:${NC}"
    
    # Check service directories and .env files
    local services_ready=0
    local total_services=3
    
    for service in "${!SERVICES[@]}"; do
        local env_file="$service/.env"
        if [[ -f "$env_file" ]]; then
            echo -e "  ${GREEN}✓${NC} $service service configured (PORT=${SERVICES[$service]})"
            ((services_ready++))
        else
            echo -e "  ${RED}✗${NC} $service service missing .env file"
        fi
    done
    
    # Check microservices
    if [[ -f "microservices/.env" ]]; then
        echo -e "  ${GREEN}✓${NC} microservices configured"
    else
        echo -e "  ${RED}✗${NC} microservices missing .env file"
    fi
    
    # Check database files
    local db_files_exist=0
    if [[ -d ".db" ]]; then
        local db_count=$(find .db -name "*.sqlite*" 2>/dev/null | wc -l)
        if [[ $db_count -gt 0 ]]; then
            echo -e "  ${GREEN}✓${NC} Database files created ($db_count database(s))"
            db_files_exist=1
        else
            echo -e "  ${YELLOW}⚠${NC} Database directory exists but no database files found"
        fi
    else
        echo -e "  ${RED}✗${NC} Database directory not found"
    fi
    
    echo ""
    
    # Readiness assessment
    if [[ $services_ready -eq $total_services ]] && [[ $db_files_exist -eq 1 ]] && [[ ${#ERRORS[@]} -eq 0 ]]; then
        echo -e "${GREEN}🚀 Environment Status: READY${NC}"
        echo -e "   Your development environment is fully configured and ready to use!"
    elif [[ $services_ready -ge 2 ]]; then
        echo -e "${YELLOW}⚠️  Environment Status: PARTIALLY READY${NC}"
        echo -e "   Most services are configured, but some issues may affect functionality"
    else
        echo -e "${RED}❌ Environment Status: NEEDS ATTENTION${NC}"
        echo -e "   Several critical issues need to be resolved before development"
    fi
    
    echo ""
    
    # Next steps with conditional guidance
    echo -e "${BLUE}📋 Next Steps:${NC}"
    
    if [[ ${#ERRORS[@]} -gt 0 ]]; then
        echo -e "  ${RED}1. FIRST: Resolve the errors listed above${NC}"
        echo -e "     • Review error messages and troubleshooting tips"
        echo -e "     • Fix critical issues before starting services"
        echo -e ""
        echo -e "  ${BLUE}2. After fixing errors, start the development environment:${NC}"
    else
        echo -e "  ${BLUE}1. Start the development environment:${NC}"
    fi
    
    echo -e "     ${GREEN}./run.sh${NC}                    # Start web + app services together"
    echo -e ""
    echo -e "  ${BLUE}2. Or start services individually:${NC}"
    echo -e "     ${GREEN}npm run app:dev${NC}             # Main app service (port 3001)"
    echo -e "     ${GREEN}npm run auth:dev${NC}            # Auth service (port 3000)"
    echo -e "     ${GREEN}npm run cat:dev${NC}             # Catalog service (port 3002)"
    echo -e "     ${GREEN}npm run web:dev${NC}             # Web frontend (Vite dev server)"
    echo -e ""
    echo -e "  ${BLUE}3. Access the application:${NC}"
    echo -e "     • ${GREEN}Frontend:${NC}    http://localhost:5173 (or as shown by Vite)"
    echo -e "     • ${GREEN}Auth API:${NC}    http://localhost:3000"
    echo -e "     • ${GREEN}App API:${NC}     http://localhost:3001"
    echo -e "     • ${GREEN}Catalog API:${NC} http://localhost:3002"
    echo -e ""
    echo -e "  ${BLUE}4. Useful development commands:${NC}"
    echo -e "     ${GREEN}npm run database:migrate-*${NC}  # Run specific migrations"
    echo -e "     ${GREEN}npm run database:seed${NC}       # Populate sample data"
    echo -e "     ${GREEN}npm test${NC}                    # Run tests"
    echo -e ""
    
    # Final message based on setup status
    if [[ ${#ERRORS[@]} -eq 0 ]]; then
        echo -e "${GREEN}🎉 Happy coding! Your Chinook development environment is ready! 🚀${NC}"
    else
        echo -e "${YELLOW}💪 Almost there! Fix the issues above and you'll be ready to code! 🚀${NC}"
    fi
    
    echo -e "\n${BLUE}📚 For more help:${NC}"
    echo -e "   • Check the project README.md for detailed documentation"
    echo -e "   • Review individual service README files in their directories"
    echo -e "   • Run this script again if you need to reconfigure"
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