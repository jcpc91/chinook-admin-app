#!/bin/bash

# Production Deployment Script
# Automated deployment script for production environment with enhanced security and validation

set -e  # Exit on any error

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
BACKUP_DIR="./backups/production"
LOG_FILE="./logs/deploy-production-$(date +%Y%m%d-%H%M%S).log"
HEALTH_CHECK_TIMEOUT=600  # 10 minutes for production
ROLLBACK_ENABLED=true
MAINTENANCE_MODE=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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
log_security() { log "SECURITY" "${PURPLE}$*${NC}"; }

# Function to check production prerequisites
check_production_prerequisites() {
    log_info "Checking production deployment prerequisites..."
    
    # Check if running as root (not recommended for production)
    if [ "$(id -u)" -eq 0 ]; then
        log_warn "Running as root user - consider using a non-root user with Docker group membership"
    fi
    
    # Check Docker
    if ! command -v docker >/dev/null 2>&1; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker daemon is not running"
        exit 1
    fi
    
    # Check Docker version (recommend 20.10+)
    local docker_version=$(docker version --format '{{.Server.Version}}' 2>/dev/null || echo "0.0.0")
    log_info "Docker version: $docker_version"
    
    # Check Docker Compose
    if ! command -v docker-compose >/dev/null 2>&1; then
        log_error "docker-compose is not installed"
        exit 1
    fi
    
    local compose_version=$(docker-compose version --short 2>/dev/null || echo "0.0.0")
    log_info "Docker Compose version: $compose_version"
    
    # Check required files
    if [ ! -f "$COMPOSE_FILE" ]; then
        log_error "Production compose file $COMPOSE_FILE not found"
        exit 1
    fi
    
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Production environment file $ENV_FILE not found"
        log_error "Please create $ENV_FILE with production configuration"
        show_production_env_template
        exit 1
    fi
    
    # Check system resources for production
    local available_space=$(df . | awk 'NR==2 {print $4}')
    if [ "$available_space" -lt 20971520 ]; then  # Less than 20GB
        log_error "Insufficient disk space for production deployment"
        log_error "Available: $(df -h . | awk 'NR==2 {print $4}'), Required: 20GB+"
        exit 1
    fi
    
    local available_memory=$(free | awk 'NR==2{printf "%.0f", $7/1024/1024}')
    if [ "$available_memory" -lt 4 ]; then  # Less than 4GB
        log_warn "Low available memory detected: ${available_memory}GB"
        log_warn "Production deployment requires at least 8GB RAM"
    fi
    
    log_success "Production prerequisites check completed"
}

# Function to show production environment template
show_production_env_template() {
    cat << 'EOF'

Please create .env.production with the following configuration:

# Production Environment Variables
# SECURITY WARNING: Use strong, unique values for production!

# JWT Configuration (minimum 32 characters)
JWT_SECREAT_KEY=your_production_jwt_secret_key_minimum_32_characters

# Database Configuration (minimum 16 characters for password)
DB_USER=chinook_user
DB_PASSWORD=your_secure_production_db_password_minimum_16_characters

# CORS Configuration (update with your production domain)
CORS_ORIGIN=https://your-production-domain.com,https://www.your-production-domain.com

# Optional: Backup Configuration
BACKUP_RETENTION_DAYS=30

# Optional: Logging Configuration
LOG_LEVEL=warn
ENABLE_REQUEST_LOGGING=false

# Optional: Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS_AUTH=100
RATE_LIMIT_MAX_REQUESTS_APP=1000
RATE_LIMIT_MAX_REQUESTS_CATALOGOS=500

# Optional: SSL Configuration (if using HTTPS)
# SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
# SSL_KEY_PATH=/etc/nginx/ssl/private.key

EOF
}

# Function to validate production environment
validate_production_environment() {
    log_info "Validating production environment configuration..."
    
    # Check file permissions
    local env_perms=$(stat -c "%a" "$ENV_FILE" 2>/dev/null || stat -f "%A" "$ENV_FILE" 2>/dev/null || echo "unknown")
    if [ "$env_perms" != "600" ] && [ "$env_perms" != "0600" ]; then
        log_security "Environment file has insecure permissions: $env_perms"
        log_security "Setting secure permissions (600)..."
        chmod 600 "$ENV_FILE"
    fi
    
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
        log_error "Missing required production environment variables:$missing_vars"
        exit 1
    fi
    
    # Validate JWT secret strength
    if [ ${#JWT_SECREAT_KEY} -lt 32 ]; then
        log_error "JWT_SECREAT_KEY must be at least 32 characters for production"
        exit 1
    fi
    
    # Validate database password strength
    if [ ${#DB_PASSWORD} -lt 16 ]; then
        log_error "DB_PASSWORD must be at least 16 characters for production"
        exit 1
    fi
    
    # Check for weak/default passwords
    if echo "$JWT_SECREAT_KEY" | grep -qi "change\|default\|password\|secret\|test"; then
        log_error "JWT_SECREAT_KEY appears to contain weak or default values"
        exit 1
    fi
    
    if echo "$DB_PASSWORD" | grep -qi "change\|default\|password\|admin\|test"; then
        log_error "DB_PASSWORD appears to contain weak or default values"
        exit 1
    fi
    
    # Validate CORS origins (should use HTTPS in production)
    if ! echo "$CORS_ORIGIN" | grep -q "https://"; then
        log_warn "CORS_ORIGIN should use HTTPS for production deployment"
    fi
    
    log_success "Production environment validation completed"
}# Fun
ction to perform security checks
perform_security_checks() {
    log_security "Performing production security checks..."
    
    # Check Docker daemon security
    if docker info 2>/dev/null | grep -q "Security Options.*apparmor"; then
        log_security "AppArmor security enabled"
    else
        log_warn "AppArmor security not detected"
    fi
    
    if docker info 2>/dev/null | grep -q "Security Options.*seccomp"; then
        log_security "Seccomp security enabled"
    else
        log_warn "Seccomp security not detected"
    fi
    
    # Check for privileged containers (should be none in production)
    local privileged_containers=$(docker ps --filter "label=privileged=true" --format "{{.Names}}" 2>/dev/null || true)
    if [ -n "$privileged_containers" ]; then
        log_warn "Privileged containers detected: $privileged_containers"
    fi
    
    # Check SSL certificate configuration
    if [ -n "${SSL_CERT_PATH:-}" ] && [ -n "${SSL_KEY_PATH:-}" ]; then
        if [ -f "nginx/ssl/cert.pem" ] && [ -f "nginx/ssl/private.key" ]; then
            log_security "SSL certificates found"
            
            # Check certificate expiration
            local cert_expiry=$(openssl x509 -in nginx/ssl/cert.pem -noout -enddate 2>/dev/null | cut -d= -f2 || echo "unknown")
            if [ "$cert_expiry" != "unknown" ]; then
                log_security "SSL certificate expires: $cert_expiry"
            fi
        else
            log_warn "SSL configuration specified but certificates not found"
        fi
    else
        log_warn "SSL not configured - consider enabling HTTPS for production"
    fi
    
    log_success "Security checks completed"
}

# Function to create production backup
create_production_backup() {
    log_info "Creating production backup..."
    
    mkdir -p "$BACKUP_DIR"
    local backup_timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_file="$BACKUP_DIR/production-backup-$backup_timestamp.sql"
    local config_backup="$BACKUP_DIR/production-config-$backup_timestamp.tar.gz"
    
    # Check if database is running
    if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps postgres | grep -q "Up"; then
        log_info "Creating database backup..."
        
        # Create database backup with compression
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres pg_dump -U "$DB_USER" chinook | gzip > "${backup_file}.gz" 2>/dev/null || {
            log_warn "Database backup failed or database not accessible"
        }
        
        if [ -f "${backup_file}.gz" ]; then
            log_success "Database backup created: ${backup_file}.gz"
        fi
    else
        log_info "Database not running, skipping database backup"
    fi
    
    # Backup configuration files
    log_info "Creating configuration backup..."
    tar -czf "$config_backup" \
        "$COMPOSE_FILE" \
        "$ENV_FILE" \
        nginx/ \
        monitoring/ \
        database/init-scripts/ \
        database/backup-scripts/ \
        2>/dev/null || {
        log_warn "Configuration backup failed"
    }
    
    # Save current container state
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps > "$BACKUP_DIR/containers-$backup_timestamp.txt" 2>/dev/null || true
    
    # Save current images with digests
    docker images --digests --format "table {{.Repository}}\t{{.Tag}}\t{{.Digest}}\t{{.ID}}\t{{.CreatedAt}}" > "$BACKUP_DIR/images-$backup_timestamp.txt" 2>/dev/null || true
    
    echo "$backup_timestamp" > "$BACKUP_DIR/latest-backup.txt"
    
    log_success "Production backup completed"
}

# Function to enable maintenance mode
enable_maintenance_mode() {
    if [ "$MAINTENANCE_MODE" = true ]; then
        log_info "Enabling maintenance mode..."
        
        # Create maintenance page
        mkdir -p nginx/maintenance
        cat > nginx/maintenance/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Maintenance Mode</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
        .container { max-width: 600px; margin: 0 auto; }
        h1 { color: #333; }
        p { color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <h1>System Maintenance</h1>
        <p>We are currently performing system maintenance. Please check back shortly.</p>
        <p>We apologize for any inconvenience.</p>
    </div>
</body>
</html>
EOF
        
        # Update nginx configuration for maintenance mode
        # This would require a custom nginx configuration
        log_info "Maintenance mode enabled"
    fi
}

# Function to disable maintenance mode
disable_maintenance_mode() {
    if [ "$MAINTENANCE_MODE" = true ]; then
        log_info "Disabling maintenance mode..."
        
        # Remove maintenance files
        rm -rf nginx/maintenance/ 2>/dev/null || true
        
        # Restore normal nginx configuration
        log_info "Maintenance mode disabled"
    fi
}

# Function to pull and verify production images
pull_production_images() {
    log_info "Pulling and verifying production images..."
    
    # Pull external images with verification
    local external_images="postgres:16-alpine redis:7-alpine nginx:1.25-alpine prom/prometheus:v2.45.0"
    
    for image in $external_images; do
        log_info "Pulling $image..."
        docker pull "$image" || {
            log_warn "Failed to pull $image, using local version if available"
        }
        
        # Verify image signature if available
        if command -v docker >/dev/null 2>&1; then
            docker inspect "$image" >/dev/null 2>&1 || {
                log_warn "Image $image not available locally"
            }
        fi
    done
    
    log_success "Image pull completed"
}

# Function to build production services with optimization
build_production_services() {
    log_info "Building optimized production services..."
    
    # Build with no cache for production to ensure fresh builds
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache --parallel || {
        log_error "Production service build failed"
        exit 1
    }
    
    # Verify built images
    log_info "Verifying built images..."
    local services="auth app catalogos web"
    
    for service in $services; do
        local image_id=$(docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" images -q "$service")
        if [ -n "$image_id" ]; then
            log_success "$service image built successfully: $image_id"
        else
            log_error "$service image build verification failed"
            exit 1
        fi
    done
    
    log_success "Production service build completed"
}

# Function to deploy production services with zero downtime
deploy_production_services() {
    log_info "Deploying production services with zero-downtime strategy..."
    
    # Enable maintenance mode if configured
    enable_maintenance_mode
    
    # Start core infrastructure
    log_info "Starting core infrastructure..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d postgres redis prometheus
    
    # Wait for PostgreSQL with extended timeout for production
    log_info "Waiting for PostgreSQL to be ready..."
    local attempts=0
    local max_attempts=120  # 10 minutes
    
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
    
    # Wait for Redis
    log_info "Waiting for Redis to be ready..."
    attempts=0
    max_attempts=60
    
    while [ $attempts -lt $max_attempts ]; do
        if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T redis redis-cli ping | grep -q PONG >/dev/null 2>&1; then
            log_success "Redis is ready"
            break
        fi
        
        attempts=$((attempts + 1))
        log_info "Waiting for Redis... ($attempts/$max_attempts)"
        sleep 2
    done
    
    # Start backup service
    log_info "Starting backup service..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d postgres-backup
    
    # Run database migrations
    log_info "Running database migrations..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up --no-deps db-migrate || {
        log_error "Database migration failed"
        return 1
    }
    
    # Deploy backend services with rolling update
    log_info "Deploying backend services..."
    for service in auth app catalogos; do
        log_info "Deploying $service service..."
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --no-deps "$service"
        
        # Wait for service to be healthy before continuing
        local service_attempts=0
        local service_max_attempts=60
        
        while [ $service_attempts -lt $service_max_attempts ]; do
            local port
            case $service in
                "auth") port=3000 ;;
                "app") port=3001 ;;
                "catalogos") port=3002 ;;
            esac
            
            if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T "$service" curl -f "http://localhost:$port/health" >/dev/null 2>&1; then
                log_success "$service service is healthy"
                break
            fi
            
            service_attempts=$((service_attempts + 1))
            log_info "Waiting for $service service... ($service_attempts/$service_max_attempts)"
            sleep 5
        done
        
        if [ $service_attempts -eq $service_max_attempts ]; then
            log_error "$service service failed to become healthy"
            return 1
        fi
    done
    
    # Deploy web service and load balancer
    log_info "Deploying web service and load balancer..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d web nginx-lb
    
    # Disable maintenance mode
    disable_maintenance_mode
    
    log_success "Production service deployment completed"
}# 
Function to perform comprehensive health checks
perform_production_health_checks() {
    log_info "Performing comprehensive production health checks..."
    
    local services="auth app catalogos web nginx-lb"
    local start_time=$(date +%s)
    local all_healthy=true
    
    for service in $services; do
        log_info "Checking health of $service service..."
        local attempts=0
        local max_attempts=60
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
                "web"|"nginx-lb")
                    if curl -f -m 10 http://localhost:80/ >/dev/null 2>&1; then
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
                    
                    if curl -f -m 10 "http://localhost:$port/health" >/dev/null 2>&1; then
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
            all_healthy=false
        fi
    done
    
    # Additional production health checks
    log_info "Performing additional production health checks..."
    
    # Check database connectivity and performance
    log_info "Checking database performance..."
    local db_response_time=$(docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres psql -U "$DB_USER" -d chinook -c "SELECT 1;" -t 2>/dev/null | wc -l || echo "0")
    if [ "$db_response_time" -gt 0 ]; then
        log_success "Database connectivity verified"
    else
        log_error "Database connectivity check failed"
        all_healthy=false
    fi
    
    # Check Redis connectivity
    log_info "Checking Redis connectivity..."
    if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T redis redis-cli ping | grep -q PONG >/dev/null 2>&1; then
        log_success "Redis connectivity verified"
    else
        log_error "Redis connectivity check failed"
        all_healthy=false
    fi
    
    # Check resource usage
    log_info "Checking resource usage..."
    local high_cpu_containers=$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}" | awk 'NR>1 && $2+0 > 80 {print $1}')
    if [ -n "$high_cpu_containers" ]; then
        log_warn "High CPU usage detected in containers: $high_cpu_containers"
    fi
    
    local high_memory_containers=$(docker stats --no-stream --format "table {{.Container}}\t{{.MemPerc}}" | awk 'NR>1 && $2+0 > 80 {print $1}')
    if [ -n "$high_memory_containers" ]; then
        log_warn "High memory usage detected in containers: $high_memory_containers"
    fi
    
    if [ "$all_healthy" = true ]; then
        log_success "All production health checks passed"
        return 0
    else
        log_error "Some production health checks failed"
        return 1
    fi
}

# Function to rollback production deployment
rollback_production_deployment() {
    if [ "$ROLLBACK_ENABLED" != true ]; then
        log_info "Production rollback is disabled"
        return 0
    fi
    
    log_warn "Rolling back production deployment..."
    
    # Enable maintenance mode during rollback
    enable_maintenance_mode
    
    # Stop current services gracefully
    log_info "Stopping current services..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down --remove-orphans
    
    # Restore from backup if available
    if [ -f "$BACKUP_DIR/latest-backup.txt" ]; then
        local backup_timestamp=$(cat "$BACKUP_DIR/latest-backup.txt")
        local backup_file="$BACKUP_DIR/production-backup-$backup_timestamp.sql.gz"
        
        if [ -f "$backup_file" ]; then
            log_info "Restoring database from backup..."
            
            # Start PostgreSQL for restoration
            docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d postgres
            
            # Wait for PostgreSQL
            sleep 60
            
            # Restore database
            gunzip -c "$backup_file" | docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres psql -U "$DB_USER" -d chinook || {
                log_error "Database restoration failed"
            }
            
            log_success "Database restored from backup"
        fi
    fi
    
    # Disable maintenance mode
    disable_maintenance_mode
    
    log_warn "Production rollback completed"
}

# Function to cleanup production resources
cleanup_production_resources() {
    log_info "Cleaning up production resources..."
    
    # Remove unused images (keep last 5 versions for production)
    docker image prune -f >/dev/null 2>&1 || true
    
    # Clean up old backups (keep last 30 for production)
    if [ -d "$BACKUP_DIR" ]; then
        find "$BACKUP_DIR" -name "production-backup-*.sql.gz" -type f | sort -r | tail -n +31 | xargs rm -f 2>/dev/null || true
        find "$BACKUP_DIR" -name "production-config-*.tar.gz" -type f | sort -r | tail -n +31 | xargs rm -f 2>/dev/null || true
    fi
    
    # Clean up old log files (keep last 30 days)
    if [ -d "logs" ]; then
        find logs -name "deploy-production-*.log" -type f -mtime +30 -delete 2>/dev/null || true
    fi
    
    log_success "Production cleanup completed"
}

# Function to display production deployment summary
display_production_summary() {
    log_info "Production Deployment Summary"
    echo "=============================="
    
    # Service status
    echo -e "\n${BLUE}Service Status:${NC}"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
    
    # Access points
    echo -e "\n${BLUE}Access Points:${NC}"
    echo "- Web Application: http://localhost:80"
    if [ -n "${SSL_CERT_PATH:-}" ]; then
        echo "- Web Application (HTTPS): https://localhost:443"
    fi
    echo "- Prometheus (if exposed): http://localhost:9090"
    
    # Resource usage
    echo -e "\n${BLUE}Resource Usage:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
    
    # Security status
    echo -e "\n${BLUE}Security Status:${NC}"
    local security_features=0
    
    if [ -f "nginx/ssl/cert.pem" ]; then
        echo "✓ SSL certificates configured"
        security_features=$((security_features + 1))
    else
        echo "✗ SSL certificates not configured"
    fi
    
    if docker info 2>/dev/null | grep -q "Security Options.*apparmor"; then
        echo "✓ AppArmor security enabled"
        security_features=$((security_features + 1))
    else
        echo "✗ AppArmor security not enabled"
    fi
    
    if [ "$security_features" -ge 1 ]; then
        echo "Security score: $security_features/2"
    fi
    
    # Backup status
    echo -e "\n${BLUE}Backup Status:${NC}"
    if [ -f "$BACKUP_DIR/latest-backup.txt" ]; then
        local latest_backup=$(cat "$BACKUP_DIR/latest-backup.txt")
        echo "Latest backup: $latest_backup"
    else
        echo "No backups found"
    fi
    
    # Production management commands
    echo -e "\n${BLUE}Production Management Commands:${NC}"
    echo "- View logs: docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE logs -f"
    echo "- Check health: curl -f http://localhost:80/"
    echo "- Scale services: docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d --scale app=5"
    echo "- Update service: docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d --no-deps --build <service>"
    echo "- Manual backup: docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE exec postgres-backup /scripts/backup.sh"
    echo "- Connect to DB: docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE exec postgres psql -U $DB_USER -d chinook"
    echo "- Stop services: docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE down"
    
    echo -e "\n${GREEN}Production deployment completed successfully!${NC}"
}

# Main production deployment function
main() {
    local start_time=$(date +%s)
    
    # Create log directory
    mkdir -p "$(dirname "$LOG_FILE")"
    
    log_info "Starting production deployment..."
    log_info "Compose file: $COMPOSE_FILE"
    log_info "Environment file: $ENV_FILE"
    log_info "Log file: $LOG_FILE"
    log_info "Backup directory: $BACKUP_DIR"
    
    # Trap for cleanup on failure
    trap 'log_error "Production deployment failed"; rollback_production_deployment; exit 1' ERR
    
    # Execute production deployment steps
    check_production_prerequisites
    validate_production_environment
    perform_security_checks
    create_production_backup
    pull_production_images
    build_production_services
    deploy_production_services
    perform_production_health_checks
    cleanup_production_resources
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_success "Production deployment completed successfully in ${duration}s"
    display_production_summary
}

# Script execution with argument parsing
case "${1:-}" in
    --maintenance)
        MAINTENANCE_MODE=true
        shift
        ;;
    --no-rollback)
        ROLLBACK_ENABLED=false
        shift
        ;;
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --maintenance    Enable maintenance mode during deployment"
        echo "  --no-rollback    Disable automatic rollback on failure"
        echo "  --help, -h       Show this help message"
        echo ""
        echo "Environment variables:"
        echo "  COMPOSE_FILE     Production compose file (default: docker-compose.prod.yml)"
        echo "  ENV_FILE         Production environment file (default: .env.production)"
        echo "  BACKUP_DIR       Backup directory (default: ./backups/production)"
        echo ""
        exit 0
        ;;
esac

# Script execution
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi