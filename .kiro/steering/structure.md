# Project Structure

## Root Level
```
├── .db/                    # SQLite database files
├── .kiro/                  # Kiro AI assistant configuration
├── app/                    # Main backend service (chinook-app)
├── auth/                   # Authentication service
├── catalogos/              # Catalog management service
├── database/               # Database migrations and schemas
├── share/                  # Shared middleware and utilities
├── web/                    # Vue.js frontend application
├── microservices/          # microservicios varios
├── init.sh, init.ps1       # Project initialization script (run once) for develop
├── run.sh                  # Development startup script
├── env.development.example # env variables for development for services
├── package.json            # Root package.json monorepo
└── chinook_db_shema.json   # Database schema reference

```

## Service Architecture

### Frontend (`web/`)
- **Type**: Vue.js SPA with ES modules
- **Port**: Development server on host 0.0.0.0
- **Structure**: Standard Vue project with src/, public/, e2e/
- **Config**: Vite, ESLint, Prettier, Playwright

### Backend Services
Each service follows the same pattern:
- **Type**: CommonJS Node.js applications
- **Structure**: `src/` directory with main `app.js` entry point
- **Development**: Nodemon for hot reload
- **enviroment variables base of**: `env.development.example`
- **Ports**: 
  - auth: 3000 (default)
  - app: 3001 (default)
  - catalogos: 3002

#### Chinook App (`app/`)
- **Type**: Chinook application service
- **Port**: 3001 (default)

### Authentication (`auth/`)
- **Type**: Authentication service
- **Port**: 3000 (default)

### Catalog Management (`catalogos/`)
- **Type**: Catalog management service
- **Port**: 3002 (default)

### microservicios (`microservices/`)
- **Type**: microservicios varios
- **enviroment variables base of**: `.env.microservice.example`


### Database (`database/`)
- **Structure**: Separate migration folders per service
  - `app/` - Main application tables
  - `auth/` - Authentication tables  
  - `catalogos/` - Catalog tables
- **Tool**: Knex.js for migrations and schema management
- **Storage**: SQLite files in `.db/` directory

## Conventions

### File Organization
- Each service is self-contained with its own `package.json`
- Environment variables in `.env` files per service
- Database migrations organized by service domain
- Shared code in `share/` directory

### Naming
- Services use lowercase names (app, auth, catalogos)
- Database files follow pattern: `{service}.sqlite3`
- Migration commands: `migrate-{service}`

### Development Workflow
1. Run `init.sh` for first-time setup
2. Use `run.sh` to start web + app services together
3. Individual services can be started independently
4. Database migrations run per service as needed