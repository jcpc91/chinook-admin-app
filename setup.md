# Chinook Music Database Administration Application - Setup Guide

This guide provides step-by-step instructions to set up the development environment for the Chinook Music Database Administration Application.

## Prerequisites

Before starting, ensure you have the following installed:
- **Node.js** (with npm)
- **Git**

Verify installations:
```bash
node --version
npm --version
git --version
```

## Setup Steps

### 1. Clone and Navigate to Project

```bash
git clone https://github.com/jcpc91/chinook-admin-app.git
cd chinook-admin-app
```

### 2. Install Dependencies

Install all project dependencies:
```bash
npm install
```

### 3. Create Environment Files

The project requires environment files for different services. You can either:

**Option A: Use the automated script (recommended)**
```bash
./init.sh
```

**Option B: Create environment files manually**

Create environment files for each service:

#### Auth Service (.env)
```bash
mkdir -p auth
cp .env.development.example auth/.env
```
Edit `auth/.env` and set:
```
PORT=3000
```

#### App Service (.env)
```bash
mkdir -p app
cp .env.development.example app/.env
```
Edit `app/.env` and set:
```
PORT=3001
```

#### Catalogos Service (.env)
```bash
mkdir -p catalogos
cp .env.development.example catalogos/.env
```
Edit `catalogos/.env` and set:
```
PORT=3002
```

#### Microservices Environment
```bash
mkdir -p microservices
cp .env.microservice.example microservices/.env
```
Edit `microservices/.env` with appropriate values for:
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USER`
- `MAIL_PASSWORD`

### 4. Database Setup

Run database migrations for all services:

```bash
# App database migration
npm run database:migrate-app

# Auth database migration
npm run database:migrate-auth

# Catalogos database migration
npm run database:migrate-cat
```

Seed the database with initial data:
```bash
npm run database:seed
```

### 5. Verify Setup

Check that all environment files are created:
```bash
ls -la auth/.env app/.env catalogos/.env microservices/.env
```

## Starting the Application

### Option 1: Start All Services (Recommended)
```bash
./run.sh
```

### Option 2: Start Services Individually

Start each service in separate terminal windows:

```bash
# Terminal 1 - Auth Service (port 3000)
npm run auth:dev

# Terminal 2 - App Service (port 3001)
npm run app:dev

# Terminal 3 - Catalog Service (port 3002)
npm run cat:dev

# Terminal 4 - Web Frontend
npm run web:dev
```

## Access Points

Once all services are running, you can access:

- **Frontend**: http://localhost:5173 (or as shown by Vite)
- **Auth API**: http://localhost:3000
- **App API**: http://localhost:3001
- **Catalog API**: http://localhost:3002

## Troubleshooting

### Common Issues

1. **Port already in use**: Make sure no other applications are using ports 3000, 3001, 3002, or 5173
2. **Permission denied on scripts**: Make scripts executable:
   ```bash
   chmod +x init.sh run.sh
   ```
3. **Database migration errors**: Ensure SQLite is available and database directory has write permissions
4. **npm install fails**: Try clearing npm cache:
   ```bash
   npm cache clean --force
   npm install
   ```

### Verification Commands

Check if services are running:
```bash
# Check if ports are in use
lsof -i :3000
lsof -i :3001
lsof -i :3002
lsof -i :5173
```

### Getting Help

If you encounter issues:
1. Check the console output for specific error messages
2. Ensure all prerequisites are properly installed
3. Verify that you're running commands from the project root directory
4. Check that all environment files are properly configured

## Development Workflow

After successful setup:
1. Make your code changes
2. Services will automatically reload (nodemon/Vite hot reload)
3. Test your changes in the browser
4. Commit your changes using Git

Happy coding! 🚀
