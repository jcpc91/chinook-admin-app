# Chinook Application - Monitoring and Logging Guide

This document provides comprehensive information about the monitoring and logging infrastructure for the Chinook application.

## Overview

The Chinook application includes a complete monitoring and logging stack that provides:

- **Centralized Logging**: All container logs are collected and stored in Elasticsearch
- **Metrics Collection**: Application and infrastructure metrics via Prometheus
- **Visualization**: Grafana dashboards for metrics and Kibana for logs
- **Alerting**: Automated alerts via Alertmanager
- **Log Rotation**: Automatic log rotation and retention policies
- **Resource Monitoring**: Container and system resource usage tracking

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │    │   Fluentd       │    │  Elasticsearch  │
│   Services      │───▶│   (Log          │───▶│   (Log          │
│                 │    │   Aggregation)  │    │   Storage)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐             │
│   Prometheus    │    │   Grafana       │◀────────────┘
│   (Metrics)     │───▶│   (Dashboards)  │
└─────────────────┘    └─────────────────┘
        │                       │
        │               ┌─────────────────┐
        └──────────────▶│   Kibana        │
                        │   (Log Analysis)│
                        └─────────────────┘
```

## Components

### 1. Fluentd (Log Aggregation)
- **Purpose**: Collects logs from all containerized services
- **Port**: 24224 (log input), 24220 (health check)
- **Configuration**: `monitoring/fluentd/fluent.conf`
- **Features**:
  - JSON log parsing
  - Log enrichment with metadata
  - Multiple output destinations
  - Log filtering and routing

### 2. Elasticsearch (Log Storage)
- **Purpose**: Stores and indexes application logs
- **Port**: 9200
- **Features**:
  - Full-text search capabilities
  - Log retention policies
  - Index management
  - High availability support

### 3. Kibana (Log Visualization)
- **Purpose**: Web interface for log analysis and visualization
- **Port**: 5601
- **Features**:
  - Log search and filtering
  - Custom dashboards
  - Real-time log monitoring
  - Alert visualization

### 4. Prometheus (Metrics Collection)
- **Purpose**: Collects and stores application and infrastructure metrics
- **Port**: 9090
- **Configuration**: `monitoring/prometheus.yml`
- **Features**:
  - Time-series metrics storage
  - PromQL query language
  - Service discovery
  - Alert rule evaluation

### 5. Grafana (Metrics Visualization)
- **Purpose**: Creates dashboards and visualizations for metrics
- **Port**: 3000
- **Default Login**: admin / admin123
- **Features**:
  - Custom dashboards
  - Multiple data sources
  - Alert notifications
  - User management

### 6. Alertmanager (Alert Management)
- **Purpose**: Handles alerts sent by Prometheus
- **Port**: 9093
- **Configuration**: `monitoring/alertmanager/alertmanager.yml`
- **Features**:
  - Alert routing and grouping
  - Notification channels (email, Slack, etc.)
  - Alert silencing
  - Escalation policies

### 7. Node Exporter (System Metrics)
- **Purpose**: Collects system-level metrics
- **Port**: 9100
- **Features**:
  - CPU, memory, disk metrics
  - Network statistics
  - System load information

### 8. cAdvisor (Container Metrics)
- **Purpose**: Collects container resource usage metrics
- **Port**: 8080
- **Features**:
  - Container CPU/memory usage
  - Network and disk I/O
  - Container lifecycle events

### 9. Database Exporters
- **PostgreSQL Exporter**: Port 9187
- **Redis Exporter**: Port 9121
- **Custom Queries**: Application-specific metrics

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB RAM available for monitoring stack
- Ports 3000, 5601, 9090, 9093, 9100, 9187, 9200, 24224 available

### Starting the Monitoring Stack

#### Windows (PowerShell)
```powershell
.\docker-run.monitoring.ps1 start
```

#### Linux/macOS (Bash)
```bash
./docker-run.monitoring.sh start
```

### Accessing Services

Once started, access the following URLs:

- **Grafana**: http://localhost:3000 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **Kibana**: http://localhost:5601
- **Elasticsearch**: http://localhost:9200
- **Alertmanager**: http://localhost:9093

## Configuration

### Environment Variables

Create `.env.monitoring` file with the following variables:

```bash
# Grafana Configuration
GRAFANA_ADMIN_PASSWORD=your_secure_password

# Database Configuration
DB_USER=chinook_user
DB_PASSWORD=your_db_password

# Application Configuration
JWT_SECREAT_KEY=your_jwt_secret
CORS_ORIGIN=http://localhost:80

# Elasticsearch Configuration
ES_JAVA_OPTS=-Xms512m -Xmx512m

# Alert Configuration
ALERT_EMAIL=admin@your-domain.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/your/webhook/url
```

### Log Retention Policies

#### Fluentd Configuration
- **Buffer Size**: 2MB per chunk
- **Flush Interval**: 5 seconds
- **Retry Policy**: Exponential backoff

#### Elasticsearch Configuration
- **Index Pattern**: `chinook-logs-YYYY.MM.DD`
- **Retention**: 30 days (configurable)
- **Rotation**: Daily indices

#### Docker Log Configuration
- **Max Size**: 10MB per log file
- **Max Files**: 3 files per container
- **Driver**: json-file or fluentd

### Monitoring Metrics

#### Application Metrics
- HTTP request duration and count
- Error rates by service
- Database connection pool usage
- Custom business metrics

#### Infrastructure Metrics
- CPU and memory usage
- Disk space and I/O
- Network traffic
- Container resource usage

#### Database Metrics
- Connection count and usage
- Query performance
- Database size and growth
- Slow query detection

## Alerting Rules

### Critical Alerts
- Service down (1 minute)
- Database unavailable (1 minute)
- High error rate (>5% for 3 minutes)
- Critical resource usage (>95% for 2 minutes)

### Warning Alerts
- High response time (>2s for 5 minutes)
- High resource usage (>80% for 5 minutes)
- Slow database queries (>10 for 5 minutes)
- Container restarts

### Alert Channels
- **Email**: Configured in Alertmanager
- **Slack**: Via webhook integration
- **Webhook**: Custom notification endpoints

## Log Analysis

### Log Levels
- **ERROR**: Application errors and exceptions
- **WARN**: Warning conditions
- **INFO**: General information
- **DEBUG**: Detailed debugging information

### Log Structure
```json
{
  "@timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "User authentication successful",
  "service": "auth",
  "container_name": "chinook-auth-staging",
  "environment": "staging",
  "user_id": "12345",
  "request_id": "req-abc123"
}
```

### Common Queries

#### Find Errors in Last Hour
```
level:error AND @timestamp:[now-1h TO now]
```

#### Service-Specific Logs
```
service:auth AND level:error
```

#### High Response Time Requests
```
response_time:>2000 AND @timestamp:[now-15m TO now]
```

## Dashboard Templates

### Application Dashboard
- Request rate and response time
- Error rate by service
- Active users and sessions
- Database performance

### Infrastructure Dashboard
- System resource usage
- Container metrics
- Network traffic
- Disk usage

### Database Dashboard
- Connection pool usage
- Query performance
- Database size trends
- Slow query analysis

## Troubleshooting

### Common Issues

#### Elasticsearch Not Starting
```bash
# Check available memory
docker stats

# Increase memory limit
# Edit ES_JAVA_OPTS in .env.monitoring
ES_JAVA_OPTS=-Xms1g -Xmx1g
```

#### Fluentd Connection Issues
```bash
# Check Fluentd logs
docker-compose -f monitoring/docker-compose.logging.yml logs fluentd

# Verify port accessibility
telnet localhost 24224
```

#### High Resource Usage
```bash
# Monitor resource usage
docker stats

# Scale down services if needed
docker-compose -f monitoring/docker-compose.logging.yml scale prometheus=1
```

### Log Collection Issues

#### Missing Logs
1. Check Fluentd configuration
2. Verify container logging driver
3. Check network connectivity
4. Review Elasticsearch indices

#### Log Parsing Errors
1. Check log format in applications
2. Update Fluentd parsing rules
3. Verify JSON structure
4. Check field mappings

### Performance Optimization

#### Elasticsearch Performance
- Adjust heap size based on available memory
- Configure index templates
- Set up index lifecycle management
- Monitor cluster health

#### Prometheus Performance
- Adjust scrape intervals
- Configure recording rules
- Set retention policies
- Monitor storage usage

## Maintenance

### Regular Tasks

#### Daily
- Check service health
- Review error logs
- Monitor resource usage
- Verify backup status

#### Weekly
- Review alert configurations
- Update dashboard queries
- Check log retention
- Analyze performance trends

#### Monthly
- Update monitoring stack
- Review and optimize queries
- Clean up old indices
- Update alert thresholds

### Backup and Recovery

#### Elasticsearch Backups
```bash
# Create snapshot repository
curl -X PUT "localhost:9200/_snapshot/backup_repo" -H 'Content-Type: application/json' -d'
{
  "type": "fs",
  "settings": {
    "location": "/backups"
  }
}'

# Create snapshot
curl -X PUT "localhost:9200/_snapshot/backup_repo/snapshot_1"
```

#### Grafana Backups
```bash
# Export dashboards
docker exec chinook-grafana grafana-cli admin export-dashboard

# Backup Grafana database
docker exec chinook-grafana sqlite3 /var/lib/grafana/grafana.db ".backup /backups/grafana.db"
```

## Security Considerations

### Access Control
- Change default passwords
- Configure authentication
- Set up SSL/TLS certificates
- Implement network policies

### Data Protection
- Encrypt logs at rest
- Secure metric endpoints
- Implement audit logging
- Regular security updates

### Network Security
- Use internal Docker networks
- Restrict external access
- Configure firewalls
- Monitor access logs

## Integration with CI/CD

### Automated Monitoring
- Deploy monitoring with applications
- Configure environment-specific settings
- Automate dashboard updates
- Set up deployment alerts

### Testing Integration
- Monitor test environments
- Track deployment metrics
- Alert on deployment failures
- Performance regression detection

## Support and Documentation

### Additional Resources
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Elasticsearch Documentation](https://www.elastic.co/guide/)
- [Fluentd Documentation](https://docs.fluentd.org/)

### Getting Help
1. Check service logs for errors
2. Review configuration files
3. Consult component documentation
4. Contact system administrators

---

For questions or issues with the monitoring and logging setup, please refer to this documentation or contact the development team.