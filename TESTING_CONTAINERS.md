# Container Testing Guide

This guide explains how to run unit tests for all services in containerized environments using PostgreSQL test databases.

## Overview

The containerized testing setup provides:
- **Isolated Test Environment**: Each test run uses fresh PostgreSQL test databases
- **Service Isolation**: Tests run in separate containers with proper networking
- **Automated Database Setup**: Test databases are created and migrated automatically
- **Cross-Platform Support**: Works on Windows, macOS, and Linux

## Quick Start

### Run All Tests
```bash
# Linux/macOS
./docker-test.sh

# Windows PowerShell
.\docker-test.ps1
```

### Run Tests for Specific Service
```bash
# Linux/macOS
./docker-test.sh --service auth
./docker-test.sh --service app
./docker-test.sh --service catalogos
./docker-test.sh --service web

# Windows PowerShell
.\docker-test.ps1 -Service auth
.\docker-test.ps1 -Service app
.\docker-test.ps1 -Service catalogos
.\docker-test.ps1 -Service web
```

### Rebuild Containers Before Testing
```bash
# Linux/macOS
./docker-test.sh --rebuild

# Windows PowerShell
.\docker-test.ps1 -Rebuild
```

### Enable Verbose Output
```bash
# Linux/macOS
./docker-test.sh --verbose

# Windows PowerShell
.\docker-test.ps1 -Verbose
```

## Manual Testing

You can also run tests manually using Docker Compose:

### Start Test Environment
```bash
# Start PostgreSQL test database
docker-compose -f docker-compose.test.yml up -d postgres-test

# Run database migrations
docker-compose -f docker-compose.test.yml up --exit-code-from db-migrate-test db-migrate-test
```

### Run Individual Service Tests
```bash
# Auth service tests
docker-compose -f docker-compose.test.yml up --exit-code-from auth-test auth-test

# App service tests
docker-compose -f docker-compose.test.yml up --exit-code-from app-test app-test

# Catalogos service tests
docker-compose -f docker-compose.test.yml up --exit-code-from catalogos-test catalogos-test

# Web service tests
docker-compose -f docker-compose.test.yml up --exit-code-from web-test web-test
```

### Cleanup Test Environment
```bash
docker-compose -f docker-compose.test.yml down -v --remove-orphans
```

## Test Configuration

### Backend Services (Jest)

Each backend service uses Jest with container-specific configurations:

- **Configuration File**: `jest.config.container.js`
- **Setup File**: `tests/setup.container.js`
- **Database**: PostgreSQL test database
- **Timeout**: 30 seconds (increased for container environment)
- **Workers**: Single worker (sequential execution)

#### Environment Variables
```bash
NODE_ENV=test
DB_TYPE=postgresql
DB_HOST=postgres-test
DB_NAME=chinook_{service}_test
DB_USER=test_user
DB_PASSWORD=test_password
DB_PORT=5432
```

### Frontend Service (Vitest)

The web service uses Vitest with container-specific configurations:

- **Configuration File**: `vitest.config.container.js`
- **Environment**: jsdom
- **Timeout**: 30 seconds
- **Pool**: Single fork execution

#### Environment Variables
```bash
NODE_ENV=test
VITE_MODE=test
VITE_BASE_URL=http://app-test:3001
VITE_URL_AUTH=http://auth-test:3000
VITE_CATALOGOS_URL=http://catalogos-test:3002
```

## Database Setup

### Test Databases

The PostgreSQL test container creates separate databases for each service:
- `chinook_auth_test` - Authentication service tests
- `chinook_app_test` - Main application service tests
- `chinook_catalogos_test` - Catalog service tests

### Migration Process

1. PostgreSQL container starts with initialization scripts
2. Database migration service runs Knex migrations for each service
3. Test containers wait for migrations to complete before running tests

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check if PostgreSQL is running
docker-compose -f docker-compose.test.yml ps postgres-test

# Check PostgreSQL logs
docker-compose -f docker-compose.test.yml logs postgres-test

# Manually test database connection
docker-compose -f docker-compose.test.yml exec postgres-test psql -U test_user -d chinook_test -c "SELECT 1;"
```

#### Test Timeout Issues
```bash
# Run with verbose output to see detailed logs
./docker-test.sh --verbose

# Check individual service logs
docker-compose -f docker-compose.test.yml logs auth-test
docker-compose -f docker-compose.test.yml logs app-test
docker-compose -f docker-compose.test.yml logs catalogos-test
docker-compose -f docker-compose.test.yml logs web-test
```

#### Container Build Issues
```bash
# Rebuild all containers
./docker-test.sh --rebuild

# Build specific service container
docker-compose -f docker-compose.test.yml build auth-test
```

### Port Conflicts

Test containers use different ports to avoid conflicts:
- `postgres-test`: 5433 (external), 5432 (internal)
- `auth-test`: 3010 (external), 3000 (internal)
- `app-test`: 3011 (external), 3001 (internal)
- `catalogos-test`: 3012 (external), 3002 (internal)
- `web-test`: 5174 (external), 5173 (internal)

### Performance Optimization

#### Faster Test Execution
```bash
# Run tests for specific service only
./docker-test.sh --service auth

# Use existing containers (skip rebuild)
./docker-test.sh  # Default behavior
```

#### Resource Management
```bash
# Clean up test volumes after testing
docker volume prune -f

# Remove unused test images
docker image prune -f
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Container Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Container Tests
        run: ./docker-test.sh --verbose
```

### Jenkins Pipeline Example
```groovy
pipeline {
    agent any
    stages {
        stage('Container Tests') {
            steps {
                sh './docker-test.sh --rebuild'
            }
        }
    }
    post {
        always {
            sh 'docker-compose -f docker-compose.test.yml down -v --remove-orphans'
        }
    }
}
```

## Development Workflow

### Before Committing Code
```bash
# Run all tests to ensure nothing is broken
./docker-test.sh

# Run tests for specific service you modified
./docker-test.sh --service app
```

### Testing Database Changes
```bash
# Rebuild containers to include new migrations
./docker-test.sh --rebuild

# Test specific service with database changes
./docker-test.sh --service app --rebuild
```

### Debugging Test Failures
```bash
# Run with verbose output
./docker-test.sh --service auth --verbose

# Keep containers running for inspection
docker-compose -f docker-compose.test.yml up auth-test
# In another terminal:
docker-compose -f docker-compose.test.yml exec auth-test sh
```

## Best Practices

1. **Always run tests before committing** to ensure your changes don't break existing functionality
2. **Use specific service testing** during development to save time
3. **Rebuild containers** when you change dependencies or Docker configurations
4. **Clean up regularly** to avoid disk space issues with test volumes
5. **Use verbose mode** when debugging test failures
6. **Test database migrations** by rebuilding containers after schema changes

## Configuration Files

### Key Files
- `docker-compose.test.yml` - Test environment orchestration
- `docker-test.sh` / `docker-test.ps1` - Test execution scripts
- `*/jest.config.container.js` - Jest configuration for backend services
- `web/vitest.config.container.js` - Vitest configuration for frontend
- `*/tests/setup.container.js` - Test setup files with PostgreSQL configuration

### Environment Templates
Each service includes container-specific test configurations that handle:
- PostgreSQL connection settings
- Service-to-service communication
- Timeout and retry logic
- Test isolation and cleanup