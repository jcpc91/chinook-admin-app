#!/bin/bash

# Chinook Application - Monitoring and Logging Stack Startup Script
# This script starts the complete monitoring and logging infrastructure

set -e

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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose > /dev/null 2>&1; then
        print_error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    # Create monitoring directories
    mkdir -p monitoring/fluentd/plugins
    mkdir -p monitoring/grafana/dashboards/chinook
    mkdir -p monitoring/grafana/dashboards/infrastructure
    mkdir -p monitoring/grafana/dashboards/logging
    mkdir -p monitoring/prometheus/rules
    mkdir -p monitoring/alertmanager/templates
    
    # Set proper permissions
    chmod -R 755 monitoring/
    
    print_success "Directories created successfully"
}

# Function to validate configuration files
validate_configs() {
    print_status "Validating configuration files..."
    
    # Check if required config files exist
    local required_files=(
        "monitoring/docker-compose.logging.yml"
        "monitoring/fluentd/fluent.conf"
        "monitoring/prometheus.yml"
        "monitoring/alertmanager/alertmanager.yml"
        "monitoring/grafana/datasources/datasources.yml"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            print_error "Required configuration file not found: $file"
            exit 1
        fi
    done
    
    print_success "All configuration files are present"
}

# Function to check environment variables
check_environment() {
    print_status "Checking environment variables..."
    
    # Check for required environment variables
    local env_file=".env.monitoring"
    
    if [[ ! -f "$env_file" ]]; then
        print_warning "Environment file $env_file not found. Creating default..."
        cat > "$env_file" << EOF
# Monitoring and Logging Environment Variables
GRAFANA_ADMIN_PASSWORD=admin123
DB_USER=chinook_user
DB_PASSWORD=secure_password
JWT_SECREAT_KEY=your_jwt_secret_key
CORS_ORIGIN=http://localhost:80

# Elasticsearch Configuration
ES_JAVA_OPTS=-Xms512m -Xmx512m

# Fluentd Configuration
FLUENTD_CONF=fluent.conf
FLUENTD_OPT=-v

# Alert Configuration
ALERT_EMAIL=admin@chinook-app.local
SLACK_WEBHOOK_URL=
EOF
        print_warning "Please review and update $env_file with your actual values"
    fi
    
    print_success "Environment configuration checked"
}

# Function to start monitoring stack
start_monitoring() {
    print_status "Starting monitoring and logging stack..."
    
    # Start the logging and monitoring services
    docker-compose \
        -f monitoring/docker-compose.logging.yml \
        --env-file .env.monitoring \
        up -d
    
    print_success "Monitoring stack started successfully"
}

# Function to wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    local services=(
        "elasticsearch:9200"
        "prometheus:9090"
        "grafana:3000"
        "fluentd:24224"
    )
    
    for service in "${services[@]}"; do
        local host=$(echo $service | cut -d: -f1)
        local port=$(echo $service | cut -d: -f2)
        
        print_status "Waiting for $host:$port..."
        
        local max_attempts=30
        local attempt=1
        
        while ! nc -z localhost $port > /dev/null 2>&1; do
            if [[ $attempt -ge $max_attempts ]]; then
                print_error "Service $host:$port failed to start within expected time"
                return 1
            fi
            
            sleep 2
            ((attempt++))
        done
        
        print_success "$host:$port is ready"
    done
}

# Function to configure Grafana dashboards
configure_grafana() {
    print_status "Configuring Grafana dashboards..."
    
    # Wait a bit more for Grafana to fully initialize
    sleep 10
    
    # Import default dashboards (this would typically be done via API)
    print_status "Grafana dashboards will be available at http://localhost:3000"
    print_status "Default login: admin / admin123 (or check .env.monitoring)"
    
    print_success "Grafana configuration completed"
}

# Function to show service URLs
show_service_urls() {
    print_success "Monitoring and logging stack is ready!"
    echo ""
    echo "Service URLs:"
    echo "  📊 Grafana (Dashboards):     http://localhost:3000"
    echo "  📈 Prometheus (Metrics):     http://localhost:9090"
    echo "  🔍 Elasticsearch (Logs):     http://localhost:9200"
    echo "  📋 Kibana (Log Analysis):    http://localhost:5601"
    echo "  🚨 Alertmanager (Alerts):    http://localhost:9093"
    echo "  📊 cAdvisor (Containers):    http://localhost:8080"
    echo "  🖥️  Node Exporter (System):   http://localhost:9100"
    echo ""
    echo "Default Credentials:"
    echo "  Grafana: admin / admin123 (configurable in .env.monitoring)"
    echo ""
    echo "Log Collection:"
    echo "  Fluentd is collecting logs from all containerized services"
    echo "  Logs are stored in Elasticsearch and viewable in Kibana"
    echo ""
    echo "Monitoring:"
    echo "  Prometheus is collecting metrics from all services"
    echo "  Grafana provides visualization dashboards"
    echo "  Alertmanager handles alert notifications"
    echo ""
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start the monitoring and logging stack"
    echo "  stop      Stop the monitoring and logging stack"
    echo "  restart   Restart the monitoring and logging stack"
    echo "  status    Show status of monitoring services"
    echo "  logs      Show logs from monitoring services"
    echo "  clean     Stop and remove all monitoring containers and volumes"
    echo ""
}

# Function to stop monitoring stack
stop_monitoring() {
    print_status "Stopping monitoring and logging stack..."
    
    docker-compose \
        -f monitoring/docker-compose.logging.yml \
        --env-file .env.monitoring \
        down
    
    print_success "Monitoring stack stopped"
}

# Function to show status
show_status() {
    print_status "Monitoring stack status:"
    
    docker-compose \
        -f monitoring/docker-compose.logging.yml \
        --env-file .env.monitoring \
        ps
}

# Function to show logs
show_logs() {
    local service=${2:-}
    
    if [[ -n "$service" ]]; then
        docker-compose \
            -f monitoring/docker-compose.logging.yml \
            --env-file .env.monitoring \
            logs -f "$service"
    else
        docker-compose \
            -f monitoring/docker-compose.logging.yml \
            --env-file .env.monitoring \
            logs -f
    fi
}

# Function to clean up
clean_monitoring() {
    print_warning "This will remove all monitoring containers and volumes. Are you sure? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_status "Cleaning up monitoring stack..."
        
        docker-compose \
            -f monitoring/docker-compose.logging.yml \
            --env-file .env.monitoring \
            down -v --remove-orphans
        
        # Remove monitoring volumes
        docker volume rm -f chinook_elasticsearch_data chinook_prometheus_data chinook_grafana_data chinook_fluentd_logs 2>/dev/null || true
        
        print_success "Monitoring stack cleaned up"
    else
        print_status "Cleanup cancelled"
    fi
}

# Main execution
main() {
    local command=${1:-start}
    
    case "$command" in
        "start")
            check_docker
            check_docker_compose
            create_directories
            validate_configs
            check_environment
            start_monitoring
            wait_for_services
            configure_grafana
            show_service_urls
            ;;
        "stop")
            stop_monitoring
            ;;
        "restart")
            stop_monitoring
            sleep 2
            main start
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$@"
            ;;
        "clean")
            clean_monitoring
            ;;
        "help"|"-h"|"--help")
            show_usage
            ;;
        *)
            print_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"