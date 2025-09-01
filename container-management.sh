#!/bin/bash

# Container Management Script
# Comprehensive container management and troubleshooting utilities

set -e

# Configuration
DEFAULT_ENV="dev"
COMPOSE_FILES=(
    "dev:docker-compose.dev.yml:.env"
    "staging:docker-compose.staging.yml:.env.staging"
    "prod:docker-compose.prod.yml:.env.production"
)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }

# Function to get compose file and env file for environment
get_compose_config() {
    local env="$1"
    for config in "${COMPOSE_FILES[@]}"; do
        local env_name="${config%%:*}"
        if [ "$env_name" = "$env" ]; then
            local compose_file="${config#*:}"
            compose_file="${compose_file%:*}"
            local env_file="${config##*:}"
            echo "$compose_file:$env_file"
            return 0
        fi
    done
    log_error "Unknown environment: $env"
    exit 1
}

# Function to validate environment
validate_environment() {
    local env="$1"
    local config=$(get_compose_config "$env")
    local compose_file="${config%:*}"
    local env_file="${config#*:}"
    
    if [ ! -f "$compose_file" ]; then
        log_error "Compose file not found: $compose_file"
        exit 1
    fi
    
    if [ ! -f "$env_file" ]; then
        log_error "Environment file not found: $env_file"
        exit 1
    fi
    
    echo "$compose_file:$env_file"
}

# Function to show service status
show_status() {
    local env="${1:-$DEFAULT_ENV}"
    local config=$(validate_environment "$env")
    local compose_file="${config%:*}"
    local env_file="${config#*:}"
    
    log_info "Service Status for $env environment"
    echo "=================================="
    
    # Show running containers
    echo -e "\n${BLUE}Running Containers:${NC}"
    docker-compose -f "$compose_file" --env-file "$env_file" ps
    
    # Show resource usage
    echo -e "\n${BLUE}Resource Usage:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    
    # Show health status
    echo -e "\n${BLUE}Health Status:${NC}"
    local services=$(docker-compose -f "$compose_file" --env-file "$env_file" config --services)
    for service in $services; do
        local container_name=$(docker-compose -f "$compose_file" --env-file "$env_file" ps -q "$service" 2>/dev/null)
        if [ -n "$container_name" ]; then
            local health=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "no-healthcheck")
            case $health in
                "healthy") echo -e "  $service: ${GREEN}healthy${NC}" ;;
                "unhealthy") echo -e "  $service: ${RED}unhealthy${NC}" ;;
                "starting") echo -e "  $service: ${YELLOW}starting${NC}" ;;
                *) echo -e "  $service: ${BLUE}$health${NC}" ;;
            esac
        else
            echo -e "  $service: ${RED}not running${NC}"
        fi
    done
}

# Function to show logs
show_logs() {
    local env="${1:-$DEFAULT_ENV}"
    local service="$2"
    local follow="${3:-false}"
    local config=$(validate_environment "$env")
    local compose_file="${config%:*}"
    local env_file="${config#*:}"
    
    local log_args=""
    if [ "$follow" = "true" ]; then
        log_args="-f"
    fi
    
    if [ -n "$service" ]; then
        log_info "Showing logs for $service in $env environment"
        docker-compose -f "$compose_file" --env-file "$env_file" logs $log_args "$service"
    else
        log_info "Showing logs for all services in $env environment"
        docker-compose -f "$compose_file" --env-file "$env_file" logs $log_args
    fi
}

# Function to restart services
restart_services() {
    local env="${1:-$DEFAULT_ENV}"
    local service="$2"
    local config=$(validate_environment "$env")
    local compose_file="${config%:*}"
    local env_file="${config#*:}"
    
    if [ -n "$service" ]; then
        log_info "Restarting $service in $env environment"
        docker-compose -f "$compose_file" --env-file "$env_file" restart "$service"
        log_success "$service restarted successfully"
    else
        log_info "Restarting all services in $env environment"
        docker-compose -f "$compose_file" --env-file "$env_file" restart
        log_success "All services restarted successfully"
    fi
}

# Function to scale services
scale_services() {
    local env="${1:-$DEFAULT_ENV}"
    local service="$2"
    local replicas="$3"
    local config=$(validate_environment "$env")
    local compose_file="${config%:*}"
    local env_file="${config#*:}"
    
    if [ -z "$service" ] || [ -z "$replicas" ]; then
        log_error "Usage: scale <env> <service> <replicas>"
        exit 1
    fi
    
    log_info "Scaling $service to $replicas replicas in $env environment"
    docker-compose -f "$compose_file" --env-file "$env_file" up -d --scale "$service=$replicas"
    log_success "$service scaled to $replicas replicas"
}

# Function to update services
update_services() {
    local env="${1:-$DEFAULT_ENV}"
    local service="$2"
    local config=$(validate_environment "$env")
    local compose_file="${config%:*}"
    local env_file="${config#*:}"
    
    if [ -n "$service" ]; then
        log_info "Updating $service in $env environment"
        docker-compose -f "$compose_file" --env-file "$env_file" up -d --no-deps --build "$service"
        log_success "$service updated successfully"
    else
        log_info "Updating all services in $env environment"
        docker-compose -f "$compose_file" --env-file "$env_file" up -d --build
        log_success "All services updated successfully"
    fi
}

# Function to perform health checks
health_check() {
    local env="${1:-$DEFAULT_ENV}"
    local config=$(validate_environment "$env")
    local compose_file="${config%:*}"
    local env_file="${config#*:}"
    
    log_info "Performing health checks for $env environment"
    
    # Check service endpoints
    case $env in
        "dev")
            local endpoints=(
                "web:http://localhost:5173/"
                "auth:http://localhost:3000/health"
                "app:http://localhost:3001/health"
                "catalogos:http://localhost:3002/health"
            )
            ;;
        "staging"|"prod")
            local endpoints=(
                "web:http://localhost:80/"
                "auth:http://localhost:3000/health"
                "app:http://localhost:3001/health"
                "catalogos:http://localhost:3002/health"
            )
            ;;
    esac
    
    local all_healthy=true
    for endpoint in "${endpoints[@]}"; do
        local service="${endpoint%:*}"
        local url="${endpoint#*:}"
        
        if curl -f -m 10 "$url" >/dev/null 2>&1; then
            echo -e "  $service: ${GREEN}healthy${NC}"
        else
            echo -e "  $service: ${RED}unhealthy${NC}"
            all_healthy=false
        fi
    done
    
    # Check database connectivity
    if docker-compose -f "$compose_file" --env-file "$env_file" ps postgres | grep -q "Up"; then
        if docker-compose -f "$compose_file" --env-file "$env_file" exec -T postgres pg_isready >/dev/null 2>&1; then
            echo -e "  database: ${GREEN}healthy${NC}"
        else
            echo -e "  database: ${RED}unhealthy${NC}"
            all_healthy=false
        fi
    fi
    
    if [ "$all_healthy" = true ]; then
        log_success "All health checks passed"
    else
        log_error "Some health checks failed"
        return 1
    fi
}

# Function to backup database
backup_database() {
    local env="${1:-$DEFAULT_ENV}"
    local config=$(validate_environment "$env")
    local compose_file="${config%:*}"
    local env_file="${config#*:}"
    
    # Source environment variables
    set -a
    source "$env_file"
    set +a
    
    local backup_dir="./backups/$env"
    mkdir -p "$backup_dir"
    local backup_file="$backup_dir/backup-$(date +%Y%m%d-%H%M%S).sql"
    
    log_info "Creating database backup for $env environment"
    
    if [ "$env" = "dev" ]; then
        # For development, backup SQLite files
        if [ -d ".db" ]; then
            tar -czf "${backup_file%.sql}.tar.gz" .db/
            log_success "SQLite backup created: ${backup_file%.sql}.tar.gz"
        else
            log_warn "No SQLite database files found"
        fi
    else
        # For staging/production, backup PostgreSQL
        if docker-compose -f "$compose_file" --env-file "$env_file" ps postgres | grep -q "Up"; then
            docker-compose -f "$compose_file" --env-file "$env_file" exec -T postgres pg_dump -U "$DB_USER" chinook > "$backup_file"
            log_success "PostgreSQL backup created: $backup_file"
        else
            log_error "PostgreSQL container is not running"
            return 1
        fi
    fi
}

# Function to restore database
restore_database() {
    local env="${1:-$DEFAULT_ENV}"
    local backup_file="$2"
    local config=$(validate_environment "$env")
    local compose_file="${config%:*}"
    local env_file="${config#*:}"
    
    if [ -z "$backup_file" ]; then
        log_error "Usage: restore <env> <backup_file>"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    # Source environment variables
    set -a
    source "$env_file"
    set +a
    
    log_info "Restoring database for $env environment from $backup_file"
    
    if [ "$env" = "dev" ]; then
        # For development, restore SQLite files
        if [[ "$backup_file" == *.tar.gz ]]; then
            tar -xzf "$backup_file"
            log_success "SQLite database restored"
        else
            log_error "Invalid backup file format for development environment"
            return 1
        fi
    else
        # For staging/production, restore PostgreSQL
        if docker-compose -f "$compose_file" --env-file "$env_file" ps postgres | grep -q "Up"; then
            docker-compose -f "$compose_file" --env-file "$env_file" exec -T postgres psql -U "$DB_USER" -d chinook < "$backup_file"
            log_success "PostgreSQL database restored"
        else
            log_error "PostgreSQL container is not running"
            return 1
        fi
    fi
}#
 Function to clean up resources
cleanup_resources() {
    local env="${1:-all}"
    local force="${2:-false}"
    
    log_info "Cleaning up Docker resources"
    
    if [ "$env" != "all" ]; then
        local config=$(validate_environment "$env")
        local compose_file="${config%:*}"
        local env_file="${config#*:}"
        
        log_info "Stopping services in $env environment"
        docker-compose -f "$compose_file" --env-file "$env_file" down --remove-orphans
        
        if [ "$force" = "true" ]; then
            log_warn "Removing volumes for $env environment (this will delete data)"
            docker-compose -f "$compose_file" --env-file "$env_file" down --volumes
        fi
    fi
    
    # Clean up unused resources
    log_info "Removing unused containers"
    docker container prune -f
    
    log_info "Removing unused images"
    docker image prune -f
    
    log_info "Removing unused networks"
    docker network prune -f
    
    if [ "$force" = "true" ]; then
        log_warn "Removing unused volumes (this may delete data)"
        docker volume prune -f
    fi
    
    log_success "Cleanup completed"
}

# Function to troubleshoot issues
troubleshoot() {
    local env="${1:-$DEFAULT_ENV}"
    local service="$2"
    local config=$(validate_environment "$env")
    local compose_file="${config%:*}"
    local env_file="${config#*:}"
    
    log_info "Troubleshooting $env environment"
    echo "================================"
    
    # Check Docker daemon
    echo -e "\n${BLUE}Docker Daemon Status:${NC}"
    if docker info >/dev/null 2>&1; then
        echo "✓ Docker daemon is running"
    else
        echo "✗ Docker daemon is not running"
        return 1
    fi
    
    # Check compose file
    echo -e "\n${BLUE}Compose Configuration:${NC}"
    if docker-compose -f "$compose_file" --env-file "$env_file" config >/dev/null 2>&1; then
        echo "✓ Compose configuration is valid"
    else
        echo "✗ Compose configuration has errors"
        docker-compose -f "$compose_file" --env-file "$env_file" config
        return 1
    fi
    
    # Check service status
    echo -e "\n${BLUE}Service Status:${NC}"
    docker-compose -f "$compose_file" --env-file "$env_file" ps
    
    # Check resource usage
    echo -e "\n${BLUE}Resource Usage:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
    
    # Check disk space
    echo -e "\n${BLUE}Disk Space:${NC}"
    df -h
    
    # Check Docker system info
    echo -e "\n${BLUE}Docker System Info:${NC}"
    docker system df
    
    # Check network connectivity
    echo -e "\n${BLUE}Network Connectivity:${NC}"
    local services=$(docker-compose -f "$compose_file" --env-file "$env_file" config --services)
    for svc in $services; do
        local container_id=$(docker-compose -f "$compose_file" --env-file "$env_file" ps -q "$svc" 2>/dev/null)
        if [ -n "$container_id" ]; then
            local ip=$(docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$container_id" 2>/dev/null)
            if [ -n "$ip" ]; then
                echo "  $svc: $ip"
            else
                echo "  $svc: no IP assigned"
            fi
        fi
    done
    
    # Service-specific troubleshooting
    if [ -n "$service" ]; then
        echo -e "\n${BLUE}Service-specific Troubleshooting: $service${NC}"
        
        # Show service logs
        echo "Recent logs:"
        docker-compose -f "$compose_file" --env-file "$env_file" logs --tail=20 "$service"
        
        # Check service health
        local container_id=$(docker-compose -f "$compose_file" --env-file "$env_file" ps -q "$service" 2>/dev/null)
        if [ -n "$container_id" ]; then
            echo -e "\nContainer details:"
            docker inspect "$container_id" | jq '.[] | {State: .State, Health: .State.Health}'
        fi
    fi
}

# Function to monitor services
monitor() {
    local env="${1:-$DEFAULT_ENV}"
    local interval="${2:-5}"
    local config=$(validate_environment "$env")
    local compose_file="${config%:*}"
    local env_file="${config#*:}"
    
    log_info "Monitoring $env environment (refresh every ${interval}s, press Ctrl+C to stop)"
    
    while true; do
        clear
        echo "=== Container Monitoring - $(date) ==="
        echo ""
        
        # Service status
        echo -e "${BLUE}Service Status:${NC}"
        docker-compose -f "$compose_file" --env-file "$env_file" ps
        echo ""
        
        # Resource usage
        echo -e "${BLUE}Resource Usage:${NC}"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
        echo ""
        
        # Health status
        echo -e "${BLUE}Health Status:${NC}"
        local services=$(docker-compose -f "$compose_file" --env-file "$env_file" config --services)
        for service in $services; do
            local container_name=$(docker-compose -f "$compose_file" --env-file "$env_file" ps -q "$service" 2>/dev/null)
            if [ -n "$container_name" ]; then
                local health=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "no-healthcheck")
                case $health in
                    "healthy") echo -e "  $service: ${GREEN}healthy${NC}" ;;
                    "unhealthy") echo -e "  $service: ${RED}unhealthy${NC}" ;;
                    "starting") echo -e "  $service: ${YELLOW}starting${NC}" ;;
                    *) echo -e "  $service: ${BLUE}$health${NC}" ;;
                esac
            else
                echo -e "  $service: ${RED}not running${NC}"
            fi
        done
        
        sleep "$interval"
    done
}

# Function to execute commands in containers
exec_command() {
    local env="${1:-$DEFAULT_ENV}"
    local service="$2"
    shift 2
    local command="$*"
    local config=$(validate_environment "$env")
    local compose_file="${config%:*}"
    local env_file="${config#*:}"
    
    if [ -z "$service" ] || [ -z "$command" ]; then
        log_error "Usage: exec <env> <service> <command>"
        exit 1
    fi
    
    log_info "Executing command in $service container: $command"
    docker-compose -f "$compose_file" --env-file "$env_file" exec "$service" $command
}

# Function to show help
show_help() {
    cat << 'EOF'
Container Management Script

Usage: ./container-management.sh <command> [options]

Commands:
  status [env]                    Show service status
  logs [env] [service] [follow]   Show logs (follow: true/false)
  restart [env] [service]         Restart services
  scale <env> <service> <count>   Scale service to specified replicas
  update [env] [service]          Update services (rebuild and restart)
  health [env]                    Perform health checks
  backup [env]                    Backup database
  restore <env> <backup_file>     Restore database from backup
  cleanup [env] [force]           Clean up resources (force: true/false)
  troubleshoot [env] [service]    Troubleshoot issues
  monitor [env] [interval]        Monitor services (interval in seconds)
  exec <env> <service> <command>  Execute command in container
  help                           Show this help message

Environments:
  dev      - Development environment (default)
  staging  - Staging environment
  prod     - Production environment

Examples:
  ./container-management.sh status staging
  ./container-management.sh logs prod web true
  ./container-management.sh restart dev auth
  ./container-management.sh scale prod app 3
  ./container-management.sh backup staging
  ./container-management.sh troubleshoot dev
  ./container-management.sh exec staging postgres psql -U chinook_user -d chinook

EOF
}

# Main function
main() {
    local command="$1"
    shift || true
    
    case "$command" in
        "status")
            show_status "$@"
            ;;
        "logs")
            show_logs "$@"
            ;;
        "restart")
            restart_services "$@"
            ;;
        "scale")
            scale_services "$@"
            ;;
        "update")
            update_services "$@"
            ;;
        "health")
            health_check "$@"
            ;;
        "backup")
            backup_database "$@"
            ;;
        "restore")
            restore_database "$@"
            ;;
        "cleanup")
            cleanup_resources "$@"
            ;;
        "troubleshoot")
            troubleshoot "$@"
            ;;
        "monitor")
            monitor "$@"
            ;;
        "exec")
            exec_command "$@"
            ;;
        "help"|"--help"|"-h"|"")
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Make sure jq is available for JSON parsing
if ! command -v jq >/dev/null 2>&1; then
    log_warn "jq is not installed. Some features may not work properly."
    log_info "Install jq with: apt-get install jq (Ubuntu/Debian) or brew install jq (macOS)"
fi

# Script execution
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi