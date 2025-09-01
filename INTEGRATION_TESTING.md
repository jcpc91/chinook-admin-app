# Integration Testing Guide

This document describes the comprehensive integration testing setup for the Chinook Admin App across different environments.

## Overview

The integration testing suite validates:
- Service communication between frontend and backend services
- Database connectivity and operations
- Environment-specific configurations
- Complete application workflows
- Container orchestration and dependencies
- CORS and security configurations

## Test Environments

### 1. Development Environment
- **Frontend**: Containerized Vue.js app (port 5173)
- **Backend**: Local Express.js services (ports 3000, 3001, 3002)
- **Database**: Local SQLite files
- **Network**: Host networking with `host.docker.internal`

### 2. Staging Environment
- **Frontend**: Containerized Vue.js app (port 80)
- **Backend**: Containerized Express.js services
- **Database**: Containerized PostgreSQL
- **Network**: Internal Docker networking

### 3. Production Environment
- **Frontend**: Production-optimized containerized Vue.js app
- **Backend**: Production-optimized containerized services
- **Database**: Production PostgreSQL with Redis cache
- **Network**: Internal Docker networking with security optimizations

## Test Structure

```
web/e2e/
├── integration/
│   ├── service-communication.spec.js    # Service-to-service communication tests
│   ├── complete-workflow.spec.js        # End-to-end user workflow tests
│   └── environment-specific.spec.js     # Environment configuration tests
├── setup/
│   ├── global-setup-dev.js             # Development environment setup
│   ├── global-teardown-dev.js          # Development environment cleanup
│   ├── global-setup-staging.js         # Staging environment setup
│   ├── global-teardown-staging.js      # Staging environment cleanup
│   ├── global-setup-production.js      # Production environment setup
│   └── global-teardown-production.js   # Production environment cleanup
└── vue.spec.js                         # Basic Vue.js tests
```

## Configuration Files

### Playwright Configurations
- `playwright.config.dev.js` - Development environment configuration
- `playwright.config.staging.js` - Staging environment configuration
- `playwright.config.production.js` - Production environment configuration

### Docker Compose Files
- `docker-compose.dev.yml` - Development environment (web only)
- `docker-compose.staging.yml` - Full staging environment
- `docker-compose.prod.yml` - Production environment
- `docker-compose.e2e.yml` - Dedicated E2E testing environment
- `docker-compose.test.yml` - Unit testing environment

## Running Tests

### Prerequisites
1. Docker and Docker Compose installed
2. Node.js and npm installed
3. PowerShell (Windows) or Bash (Linux/macOS)

### Quick Start

#### Run All Integration Tests
```powershell
# PowerShell (Windows)
.\test-integration-all.ps1 -All

# Bash (Linux/macOS)
./test-integration-dev.sh && ./test-integration-staging.sh && ./test-integration-production.sh
```

#### Run Specific Environment Tests
```powershell
# Development only
.\test-integration-all.ps1 -Dev

# Staging only
.\test-integration-all.ps1 -Staging

# Production only
.\test-integration-all.ps1 -Production

# Multiple environments
.\test-integration-all.ps1 -Dev -Staging
```

### Manual Test Execution

#### Development Environment
```bash
# 1. Start local backend services
./init.sh
cd auth && npm run dev &
cd app && npm run dev &
cd catalogos && npm run dev &

# 2. Start containerized web service
docker-compose -f docker-compose.dev.yml up -d web

# 3. Run tests
cd web
npm run test:e2e:dev
```

#### Staging Environment
```bash
# 1. Create environment file
echo "JWT_SECREAT_KEY=staging_secret
DB_USER=chinook_user
DB_PASSWORD=staging_password" > .env.staging

# 2. Start staging environment
docker-compose -f docker-compose.staging.yml --env-file .env.staging up -d

# 3. Run tests
cd web
npm run test:e2e:staging

# 4. Cleanup
docker-compose -f docker-compose.staging.yml down -v
```

#### Production Environment
```bash
# 1. Create environment file
echo "JWT_SECREAT_KEY=production_secret
DB_USER=chinook_user
DB_PASSWORD=production_password
CORS_ORIGIN=http://localhost:80" > .env.production

# 2. Start production environment
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# 3. Run tests
cd web
npm run test:e2e:production

# 4. Cleanup
docker-compose -f docker-compose.prod.yml down -v
```

## Test Categories

### Service Communication Tests
- Health check endpoints for all services
- CORS configuration validation
- Service timeout handling
- Environment-specific URL validation
- Database connectivity through services

### Complete Workflow Tests
- User registration and authentication
- Data operations (CRUD) across services
- Error handling scenarios
- Session persistence
- Concurrent request handling
- End-to-end data flow validation

### Environment-Specific Tests
- Environment configuration detection
- Database type validation (SQLite vs PostgreSQL)
- Network communication patterns
- Service startup order validation
- Resource limits and performance (production)

## Test Data Management

### Development Environment
- Uses local SQLite databases
- Test data persists between test runs
- Manual cleanup required for test isolation

### Staging/Production Environments
- Uses containerized PostgreSQL
- Fresh database for each test run
- Automatic cleanup after tests

### Test Database Setup
```sql
-- E2E databases are created automatically:
-- chinook_auth_e2e
-- chinook_app_e2e
-- chinook_catalogos_e2e
```

## Troubleshooting

### Common Issues

#### Docker Issues
```bash
# Check Docker status
docker info

# Clean up containers and volumes
docker-compose down -v
docker system prune -f
```

#### Service Startup Issues
```bash
# Check service logs
docker-compose logs [service-name]

# Check service health
curl http://localhost:[port]/health
```

#### Port Conflicts
- Development web: 5173
- Development auth: 3000
- Development app: 3001
- Development catalogos: 3002
- Staging web: 80
- Production web: 80
- E2E web: 5175
- E2E auth: 3010
- E2E app: 3011
- E2E catalogos: 3012

#### Database Connection Issues
```bash
# Check PostgreSQL status
docker exec [postgres-container] pg_isready -U [username] -d [database]

# Check database logs
docker logs [postgres-container]
```

### Debug Mode

#### Enable Verbose Logging
```bash
# Set environment variables for detailed logging
export DEBUG=true
export VERBOSE_TESTS=true
export LOG_LEVEL=debug
```

#### Run Tests with Debug Output
```bash
# Playwright debug mode
cd web
npx playwright test --debug

# Headed mode (show browser)
npx playwright test --headed
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Integration Tests
on: [push, pull_request]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd web && npm ci
          npx playwright install --with-deps
      
      - name: Run development tests
        run: ./test-integration-dev.sh
      
      - name: Run staging tests
        run: ./test-integration-staging.sh
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: web/test-results/
```

## Performance Considerations

### Test Execution Times
- Development tests: ~2-5 minutes
- Staging tests: ~5-10 minutes
- Production tests: ~10-15 minutes

### Resource Requirements
- RAM: 4GB minimum, 8GB recommended
- CPU: 2 cores minimum, 4 cores recommended
- Disk: 10GB free space for Docker images and volumes

### Optimization Tips
1. Use `--workers=1` for CI environments
2. Enable Docker layer caching
3. Reuse existing containers when possible
4. Run tests in parallel when safe
5. Use headless mode in CI

## Maintenance

### Regular Tasks
1. Update Playwright browsers: `npx playwright install`
2. Clean up Docker resources: `docker system prune -f`
3. Update test data and scenarios
4. Review and update environment configurations

### Updating Tests
1. Add new test cases to appropriate spec files
2. Update global setup/teardown as needed
3. Maintain environment-specific configurations
4. Document new test scenarios

## Security Considerations

### Test Environment Security
- Use separate test databases
- Avoid production secrets in test configurations
- Clean up test data after execution
- Use isolated Docker networks
- Implement proper CORS configurations

### Secrets Management
```bash
# Use environment files for sensitive data
echo "JWT_SECREAT_KEY=test_secret" > .env.test
echo ".env.test" >> .gitignore
```

## Contributing

### Adding New Tests
1. Create test files in appropriate directories
2. Follow existing naming conventions
3. Include proper setup and teardown
4. Document test scenarios and expected outcomes
5. Update this README with new test information

### Test Guidelines
- Write descriptive test names
- Include proper error handling
- Use appropriate timeouts
- Clean up test data
- Validate both positive and negative scenarios