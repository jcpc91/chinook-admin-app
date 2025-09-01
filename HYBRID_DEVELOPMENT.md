# Hybrid Development Environment

This document describes the hybrid development environment setup for the Chinook Admin App, where the web frontend runs in a Docker container while backend services run locally.

## Overview

The hybrid development approach provides:
- **Containerized Frontend**: Vue.js web application runs in Docker for consistency
- **Local Backend Services**: Express.js services (auth, app, catalogos) run locally for easier debugging
- **Local Database**: SQLite files stored locally for rapid development
- **Hot Reload**: Both containerized and local services support hot reload

## Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Web Container │    │  Local Services │
│   (Vue.js)      │◄──►│  auth:3000      │
│   :5173         │    │  app:3001       │
└─────────────────┘    │  catalogos:3002 │
                       └─────────────────┘
                              │
                       ┌─────────────────┐
                       │ Local Database  │
                       │ SQLite files    │
                       │ (.db/)          │
                       └─────────────────┘
```

## Quick Start

### 1. Initialize Environment

**Windows (PowerShell):**
```powershell
./docker-init.dev.ps1
```

**Linux/macOS (Bash):**
```bash
./docker-init.dev.sh
```

### 2. Start Services

**Option A: Manual startup**
```bash
# Terminal 1: Start containerized web service
docker-compose -f docker-compose.dev.yml up web

# Terminal 2: Start auth service
cd auth && npm run dev

# Terminal 3: Start app service  
cd app && npm run dev

# Terminal 4: Start catalogos service
cd catalogos && npm run dev
```

**Option B: Use startup script (when available)**
```bash
./docker-run.dev.sh    # Linux/macOS
./docker-run.dev.ps1   # Windows
```

### 3. Access Application

- **Web Application**: http://localhost:5173
- **Auth Service**: http://localhost:3000
- **App Service**: http://localhost:3001
- **Catalogos Service**: http://localhost:3002

## Environment Configuration

### Web Service (Containerized)
- **File**: `web/.env.development`
- **Key Settings**:
  - Uses `host.docker.internal` to communicate with local backend services
  - CORS configured for container-to-host communication
  - Hot reload enabled via volume mounts

### Backend Services (Local)
- **Files**: `auth/.env`, `app/.env`, `catalogos/.env`
- **Key Settings**:
  - CORS configured to accept requests from containerized web service
  - SQLite database connections to local `.db/` directory
  - Service-to-service communication via localhost

### Docker Compose
- **File**: `.env` (root level)
- **Purpose**: Environment variables for Docker Compose configuration

## Development Workflow

### Making Changes

**Frontend Changes (Vue.js)**:
1. Edit files in `web/src/`
2. Changes automatically reload in container via volume mounts
3. No container rebuild required

**Backend Changes (Express.js)**:
1. Edit files in `auth/src/`, `app/src/`, or `catalogos/src/`
2. Nodemon automatically restarts the local service
3. No container operations required

**Database Changes**:
1. Create new migration files in `database/{service}/`
2. Run migrations: `cd database && npm run migrate-{service}`
3. Changes immediately available to local services

### Debugging

**Frontend Debugging**:
- Use browser dev tools as normal
- Container logs: `docker-compose -f docker-compose.dev.yml logs web`

**Backend Debugging**:
- Use your preferred Node.js debugging tools
- Services run locally with full access to debuggers
- Console logs appear directly in terminal

### Testing

**Unit Tests**:
```bash
# Frontend tests (in container)
docker-compose -f docker-compose.dev.yml exec web npm run test:unit

# Backend tests (local)
cd auth && npm test
cd app && npm test
cd catalogos && npm test
```

**E2E Tests**:
```bash
cd web && npm run test:e2e
```

## Troubleshooting

### Common Issues

**Web service can't connect to backend services**:
- Ensure backend services are running locally
- Check that `host.docker.internal` is properly configured
- Verify CORS settings in backend `.env` files

**Container build fails**:
- Check Docker is running
- Verify `web/Dockerfile` exists and is valid
- Try rebuilding: `docker-compose -f docker-compose.dev.yml build web`

**Database connection errors**:
- Ensure `.db/` directory exists with SQLite files
- Run database migrations: `cd database && npm run migrate-{service}`
- Check database file permissions

**Port conflicts**:
- Ensure ports 3000, 3001, 3002, 5173 are available
- Stop any existing services using these ports
- Check for other Docker containers using the same ports

### Validation

Run the validation script to check your setup:

**Windows:**
```powershell
./validate-dev-setup.ps1
```

**Linux/macOS:**
```bash
./validate-dev-setup.sh  # (if created)
```

## Switching to Full Containerization

To switch to full containerization (staging/production mode):

1. Stop local backend services
2. Use staging configuration:
   ```bash
   docker-compose -f docker-compose.staging.yml up
   ```

## Benefits of Hybrid Approach

1. **Faster Backend Development**: No container rebuilds for backend changes
2. **Easy Debugging**: Full access to Node.js debugging tools
3. **Consistent Frontend**: Web service runs in same container as production
4. **Rapid Database Changes**: Direct access to SQLite files
5. **Resource Efficient**: Only one container running instead of four

## Limitations

1. **Platform Specific**: Requires `host.docker.internal` support (Docker Desktop)
2. **Network Complexity**: Mixed container/host networking
3. **Environment Differences**: Development differs from staging/production
4. **Setup Complexity**: More complex than pure local or pure containerized development

## Next Steps

- Use `docker-run.dev.sh` for automated service startup
- Implement integration tests for hybrid environment
- Consider VS Code dev container configuration for full containerization option