#!/bin/bash

# Staging Deployment Script
# Automated deployment script for staging environment with validation and rollback capabilities

set -e  # Exit on any error

# Configuration
COMPOSE_FILE="docker-compose.staging.yml"
ENV_FILE=".env.staging"
BACKUP_DIR="./backups/staging"
LOG_FILE="./logs/deploy-staging-$(date +%Y%m%d-%H%M%S).log"
HEALTH_CHECK_TIMEOUT=300  # 5 minutes
ROLLBACK_ENABLED=true

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

log_info() { log "INFO" "$@"; }
log_warn() { log "WARN" "${YELLOW}$*${NC}"; }
log_error() { log "ERROR" "${RED}$*${NC}"; }
log_success() { log "SUCCESS" "${GREEN}$*${NC}"; }

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking deployment prerequisites..."
    
    # Check Docker
    if ! command -v docker >/dev/null 2>&1; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker daemon is not running"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose >/dev/null 2>&1; then
        log_error "docker-compose is not installed"
        exit 1
    fi
    
    # Check required files
    if [ ! -f "$COMPOSE_FILE" ]; then
        log_error "Compose file $COMPOSE_FILE not found"
        exit 1
    fi
    
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Environment file $ENV_FILE not found"
        log_info "Creating default environment file..."
        create_default_env_file
    fi
    
    # Check disk space (minimum 5GB)
    local available_space=$(df . | awk 'NR==2 {print $4}')
    if [ "$available_space" -lt 5242880 ]; then
        log_warn "Low disk space detected. Available: $(df -h . | awk 'NR==2 {print $4}')"
        log_warn "Consider cleaning up with: docker system prune"
    fi
    
    log_success "Prerequisites check completed"
}

# Function to create default environment file
create_default_env_file() {
    local jwt_secret
    local db_password
    
    # Generate secure secrets
    if command -v openssl >/dev/null 2>&1; then
        jwt_secret=$(openssl rand -hex 32)
        db_password=$(openssl rand -base64 24)
    else
        jwt_secret="staging_jwt_secret_$(date +%s)_change_me"
        db_password="staging_db_password_$(date +%s)"
    fi
    
    cat > "$ENV_FILE" << EOF
# Staging Environment Variables
# Generated automatically - please review and update as needed

# JWT Configuration
JWT_SECREAT_KEY=$jwt_secret

# Database Configuration
DB_USER=chinook_user
DB_PASSWORD=$db_password

# CORS Configuration
CORS_ORIGIN=http://localhost:80,http://127.0.0.1:80

# Logging Configuration
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
EOF
    
    chmod 600 "$ENV_FILE"
    log_success "Default environment file created at $ENV_FILE"
    log_warn "Please review and update $ENV_FILE with your staging-specific values"
}

# Function to validate environment variables
validate_environment() {
    log_info "Validating environment configuration..."
    
    # Source environment file
    set -a
    source "$ENV_FILE"
    set +a
    
    # Check required variables
    local required_vars="JWT_SECREAT_KEY DB_USER DB_PASSWORD CORS_ORIGIN"
    local missing_vars=""
    
    for var in $required_vars; do
        if [ -z "${!var}" ]; then
            missing_vars="$missing_vars $var"
        fi
    done
    
    if [ -n "$missing_vars" ]; then
        log_error "Missing required environment variables:$missing_vars"
        exit 1
    fi
    
    # Validate JWT secret length
    if [ ${#JWT_SECREAT_KEY} -lt 32 ]; then
        log_error "JWT_SECREAT_KEY must be at least 32 characters long"
        exit 1
    fi
    
    # Validate database password length
    if [ ${#DB_PASSWORD} -lt 16 ]; then
        log_error "DB_PASSWORD must be at least 16 characters long"
        exit 1
    fi
    
    log_success "Environment validation completed"
}# 
Function to backup current state
backup_current_state() {
    log_info "Creating backup of current state..."
    
    mkdir -p "$BACKUP_DIR"
    local backup_timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_file="$BACKUP_DIR/staging-backup-$backup_timestamp.sql"
    
    # Check if database is running
    if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps postgres | grep -q "Up"; then
        log_info "Backing up database..."
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres pg_dump -U "$DB_USER" chinook > "$backup_file" 2>/dev/null || {
            log_warn "Database backup failed or database not accessible"
            return 0
        }
        log_success "Database backup created: $backup_file"
    else
        log_info "Database not running, skipping backup"
    fi
    
    # Save current container state
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps > "$BACKUP_DIR/containers-$backup_timestamp.txt" 2>/dev/null || true
    
    # Save current images
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}" > "$BACKUP_DIR/images-$backup_timestamp.txt" 2>/dev/null || true
    
    echo "$backup_timestamp" > "$BACKUP_DIR/latest-backup.txt"
}

# Function to pull latest images
pull_images() {
    log_info "Pulling latest base images..."
    
    # Pull external images first
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull postgres elasticmq || {
        log_warn "Failed to pull some external images, continuing with local images"
    }
    
    log_success "Image pull completed"
}

# Function to build services
build_services() {
    log_info "Building staging services..."
    
    # Build with parallel processing for faster builds
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --parallel || {
        log_error "Service build failed"
        exit 1
    }
    
    log_success "Service build completed"
}

# Function to deploy services
deploy_services() {
    log_info "Deploying staging services..."
    
    # Start PostgreSQL first
    log_info "Starting PostgreSQL database..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d postgres
    
    # Wait for PostgreSQL to be ready
    log_info "Waiting for PostgreSQL to be ready..."
    local attempts=0
    local max_attempts=60
    
    while [ $attempts -lt $max_attempts ]; do
        if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres pg_isready -U "$DB_USER" -d chinook >/dev/null 2>&1; then
            log_success "PostgreSQL is ready"
            break
        fi
        
        attempts=$((attempts + 1))
        log_info "Waiting for PostgreSQL... ($attempts/$max_attempts)"
        sleep 5
    done
    
    if [ $attempts -eq $max_attempts ]; then
        log_error "PostgreSQL failed to start within expected time"
        return 1
    fi
    
    # Run database migrations
    log_info "Running database migrations..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up --no-deps db-migrate || {
        log_error "Database migration failed"
        return 1
    }
    
    # Start backend services
    log_info "Starting backend services..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d auth app catalogos
    
    # Start web service
    log_info "Starting web service..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d web
    
    # Start additional services
    log_info "Starting additional services..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d elasticmq
    
    log_success "Service deployment completed"
}

# Function to perform health checks
health_check() {
    log_info "Performing health checks..."
    
    local services="auth app catalogos web"
    local start_time=$(date +%s)
    
    for service in $services; do
        log_info "Checking health of $service service..."
        local attempts=0
        local max_attempts=30
        local service_healthy=false
        
        while [ $attempts -lt $max_attempts ]; do
            local current_time=$(date +%s)
            local elapsed=$((current_time - start_time))
            
            if [ $elapsed -gt $HEALTH_CHECK_TIMEOUT ]; then
                log_error "Health check timeout exceeded"
                return 1
            fi
            
            # Check service health based on service type
            case $service in
                "web")
                    if curl -f http://localhost:80/ >/dev/null 2>&1; then
                        service_healthy=true
                        break
                    fi
                    ;;
                *)
                    local port
                    case $service in
                        "auth") port=3000 ;;
                        "app") port=3001 ;;
                        "catalogos") port=3002 ;;
                    esac
                    
                    if curl -f "http://localhost:$port/health" >/dev/null 2>&1; then
                        service_healthy=true
                        break
                    fi
                    ;;
            esac
            
            attempts=$((attempts + 1))
            log_info "Health check for $service... ($attempts/$max_attempts)"
            sleep 10
        done
        
        if [ "$service_healthy" = true ]; then
            log_success "$service service is healthy"
        else
            log_error "$service service health check failed"
            return 1
        fi
    done
    
    log_success "All health checks passed"
}

# Function to rollback deployment
rollback_deployment() {
    if [ "$ROLLBACK_ENABLED" != true ]; then
        log_info "Rollback is disabled"
        return 0
    fi
    
    log_warn "Rolling back deployment..."
    
    # Stop current services
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down --remove-orphans
    
    # Restore from backup if available
    if [ -f "$BACKUP_DIR/latest-backup.txt" ]; then
        local backup_timestamp=$(cat "$BACKUP_DIR/latest-backup.txt")
        local backup_file="$BACKUP_DIR/staging-backup-$backup_timestamp.sql"
        
        if [ -f "$backup_file" ]; then
            log_info "Restoring database from backup..."
            
            # Start PostgreSQL for restoration
            docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d postgres
            
            # Wait for PostgreSQL
            sleep 30
            
            # Restore database
            docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres psql -U "$DB_USER" -d chinook < "$backup_file" || {
                log_error "Database restoration failed"
            }
        fi
    fi
    
    log_warn "Rollback completed"
}

# Function to cleanup old resources
cleanup_old_resources() {
    log_info "Cleaning up old resources..."
    
    # Remove unused images (keep last 3 versions)
    docker image prune -f >/dev/null 2>&1 || true
    
    # Clean up old backups (keep last 10)
    if [ -d "$BACKUP_DIR" ]; then
        find "$BACKUP_DIR" -name "staging-backup-*.sql" -type f | sort -r | tail -n +11 | xargs rm -f 2>/dev/null || true
    fi
    
    log_success "Cleanup completed"
}

# Function to display deployment summary
display_summary() {
    log_info "Deployment Summary"
    echo "===================="
    
    # Service status
    echo -e "\n${BLUE}Service Status:${NC}"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
    
    # Access points
    echo -e "\n${BLUE}Access Points:${NC}"
    echo "- Web Application: http://localhost:80"
    echo "- Auth Service: http://localhost:3000"
    echo "- App Service: http://localhost:3001"
    echo "- Catalogos Service: http://localhost:3002"
    echo "- PostgreSQL: localhost:5432"
    echo "- ElasticMQ: http://localhost:9324"
    
    # Resource usage
    echo -e "\n${BLUE}Resource Usage:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
    
    # Useful commands
    echo -e "\n${BLUE}Useful Commands:${NC}"
    echo "- View logs: docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE logs -f"
    echo "- Check health: curl -f http://localhost:80/"
    echo "- Connect to DB: docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE exec postgres psql -U $DB_USER -d chinook"
    echo "- Stop services: docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE down"
}

# Main deployment function
main() {
    local start_time=$(date +%s)
    
    # Create log directory
    mkdir -p "$(dirname "$LOG_FILE")"
    
    log_info "Starting staging deployment..."
    log_info "Compose file: $COMPOSE_FILE"
    log_info "Environment file: $ENV_FILE"
    log_info "Log file: $LOG_FILE"
    
    # Trap for cleanup on failure
    trap 'log_error "Deployment failed"; rollback_deployment; exit 1' ERR
    
    # Execute deployment steps
    check_prerequisites
    validate_environment
    backup_current_state
    pull_images
    build_services
    deploy_services
    health_check
    cleanup_old_resources
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_success "Staging deployment completed successfully in ${duration}s"
    display_summary
}

# Script execution
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi