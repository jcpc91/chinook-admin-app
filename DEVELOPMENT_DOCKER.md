# Development Environment with Docker (Hybrid Mode)

This document describes the hybrid development setup where the web frontend runs in a Docker container while backend services run locally. This approach provides the benefits of containerization for the frontend while maintaining the flexibility of local development for backend services.

## Architecture Overview

```
┌─────────────────────┐    ┌─────────────────────┐
│   Web Container     │    │   Local Backend     │
│   (Vue.js + Vite)   │    │     Services        │
│   Port: 5173        │◄──►│                     │
│                     │    │  ┌─────────────────┐│
│  - Hot Reload       │    │  │ Auth Service    ││
│  - Volume Mounts    │    │  │ Port: 3000      ││
│  - CORS Configured  │    │  └─────────────────┘│
└─────────────────────┘    │  ┌─────────────────┐│
                           │  │ App Service     ││
                           │  │ Port: 3001      ││
                           │  └─────────────────┘│
                           │  ┌─────────────────┐│
                           │  │ Catalogos       ││
                           │  │ Port: 3002      ││
                           │  └─────────────────┘│
                           └─────────────────────┘
                                      │
                           ┌─────────────────────┐
                           │   Local SQLite      │
                           │   Database Files    │
                           │   (.db/ directory)  │
                           └─────────────────────┘
```

## Prerequisites

- Docker and Docker Compose installed
- Node.js 24+ installed locally
- npm package manager

## Quick Start

### Option 1: Automated Setup (Recommended)

**Windows (PowerShell):**
```powershell
# Initialize the development environment
.\docker-init.dev.ps1

# Start all services
.\docker-run.dev.ps1
```

**Linux/macOS (Bash):**
```bash
# Initialize the development environment
./docker-init.dev.sh

# Start all services
./docker-run.dev.sh
```

### Option 2: Manual Setup

1. **Initialize the project:**
   ```bash
   ./init.sh  # or run .\docker-init.dev.ps1 on Windows
   ```

2. **Start backend services locally:**
   ```bash
   # Terminal 1: Auth service
   cd auth && npm run dev

   # Terminal 2: App service  
   cd app && npm run dev

   # Terminal 3: Catalogos service (if available)
   cd catalogos && npm run dev
   ```

3. **Start containerized web service:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

## Configuration Files

### docker-compose.dev.yml

The main Docker Compose configuration for development:

- **Web Service**: Containerized Vue.js application with hot reload
- **Networking**: Uses `host.docker.internal` to communicate with local backend services
- **Volumes**: Source code mounted for hot reload functionality
- **Environment**: Development-specific environment variables

### Environment Variables

**Web Service (.env.development):**
```env
VITE_MODE=desarrollo
VITE_BASE_URL=http://host.docker.internal:3001
VITE_URL_AUTH=http://host.docker.internal:3000
VITE_CATALOGOS_URL=http://host.docker.internal:3002
VITE_PORT=5173
VITE_USE_PROXY=false
VITE_CORS_ORIGIN=http://localhost:5173,http://host.docker.internal:5173
```

**Backend Services (.env):**
```env
CORS_ORIGIN=http://localhost:5173,http://host.docker.internal:5173
JWT_SECREAT_KEY=dev-secret-key-change-in-production
PORT=3000  # 3001 for app, 3002 for catalogos
NODE_ENV=development
```

## Service Communication

### Frontend to Backend

The containerized web service communicates with local backend services using:

- **host.docker.internal**: Docker's special DNS name that resolves to the host machine
- **CORS Configuration**: Backend services configured to accept requests from both `localhost:5173` and `host.docker.internal:5173`
- **Environment Variables**: Frontend configured with backend URLs pointing to `host.docker.internal`

### Backend to Database

Backend services access local SQLite database files directly:

- **Database Location**: `.db/` directory in project root
- **Migrations**: Run locally using npm scripts
- **No Containerization**: Database remains on the host filesystem

## Development Workflow

### Making Changes

1. **Frontend Changes**: 
   - Edit files in `web/src/`
   - Changes are automatically reflected via volume mounts and Vite hot reload
   - No container rebuild required

2. **Backend Changes**:
   - Edit files in `auth/`, `app/`, or `catalogos/`
   - Changes are automatically reflected via nodemon
   - Services run locally, no container involved

3. **Database Changes**:
   - Create migrations in `database/{service}/`
   - Run migrations locally: `cd database && npm run migrate-{service}`

### Debugging

**Frontend Debugging:**
```bash
# View web service logs
docker-compose -f docker-compose.dev.yml logs -f web

# Access container shell
docker-compose -f docker-compose.dev.yml exec web sh
```

**Backend Debugging:**
```bash
# View service logs (if using automated scripts)
tail -f logs/auth.log
tail -f logs/app.log
tail -f logs/catalogos.log

# Or check individual terminal windows if running manually
```

### Testing

**Frontend Tests:**
```bash
# Unit tests (run in container)
docker-compose -f docker-compose.dev.yml exec web npm run test:unit

# E2E tests (run locally, targeting containerized frontend)
cd web && npm run test:e2e
```

**Backend Tests:**
```bash
# Run locally
cd auth && npm test
cd app && npm test
cd catalogos && npm test
```

## Troubleshooting

### Common Issues

1. **"host.docker.internal" not resolving:**
   - Ensure Docker Desktop is running
   - On Linux, you may need to add `--add-host=host.docker.internal:host-gateway` to docker run commands

2. **CORS errors:**
   - Verify backend services have correct CORS_ORIGIN in their .env files
   - Check that both `localhost:5173` and `host.docker.internal:5173` are included

3. **Port conflicts:**
   - Ensure ports 3000, 3001, 3002, and 5173 are not in use by other applications
   - Check if services are already running locally

4. **Volume mount issues:**
   - Ensure Docker has permission to access the project directory
   - On Windows, verify the drive is shared with Docker

### Health Checks

**Check Service Status:**
```bash
# Web service health
curl http://localhost:5173/

# Backend services health
curl http://localhost:3000/health  # Auth
curl http://localhost:3001/health  # App
curl http://localhost:3002/health  # Catalogos
```

**Docker Service Status:**
```bash
docker-compose -f docker-compose.dev.yml ps
```

### Logs and Monitoring

**Real-time Logs:**
```bash
# All services (if using automated scripts)
docker-compose -f docker-compose.dev.yml logs -f web &
tail -f logs/auth.log &
tail -f logs/app.log &
tail -f logs/catalogos.log &

# Individual services
docker-compose -f docker-compose.dev.yml logs -f web
```

## Stopping Services

**Automated Scripts:**
- Press `Ctrl+C` in the terminal running the script
- Services will be gracefully shut down

**Manual Shutdown:**
```bash
# Stop Docker services
docker-compose -f docker-compose.dev.yml down

# Stop local Node.js processes
# Use Ctrl+C in each terminal or find and kill processes:
ps aux | grep "npm run dev"
kill <PID>
```

## Benefits of This Approach

1. **Consistent Frontend Environment**: Web service runs in the same container across all development machines
2. **Fast Backend Development**: Backend services run locally with full debugging capabilities
3. **Database Simplicity**: SQLite files remain local, no container complexity
4. **Hot Reload**: Both frontend (via Docker volumes) and backend (via nodemon) support hot reload
5. **Easy Debugging**: Backend services can be debugged with local tools
6. **Gradual Migration**: Can be extended to full containerization for staging/production

## Next Steps

Once comfortable with this hybrid approach, you can:

1. **Move to Full Containerization**: Use `docker-compose.staging.yml` for complete containerization
2. **Add Database Container**: Migrate to PostgreSQL container for staging/production
3. **Implement CI/CD**: Use containerized builds for deployment pipelines