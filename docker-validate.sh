#!/bin/bash

# Docker Configuration Validation Script
# This script validates the Docker infrastructure setup

echo "🐳 Validating Docker Infrastructure Setup..."
echo "=============================================="

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running"
    exit 1
fi

echo "✅ Docker is installed and running"

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    exit 1
fi

echo "✅ Docker Compose is available"

# Validate Docker Compose files
echo ""
echo "📋 Validating Docker Compose configurations..."

compose_files=("docker-compose.yml" "docker-compose.dev.yml" "docker-compose.staging.yml" "docker-compose.prod.yml")

for file in "${compose_files[@]}"; do
    if [ -f "$file" ]; then
        if docker-compose -f "$file" config &> /dev/null; then
            echo "✅ $file is valid"
        else
            echo "❌ $file has syntax errors"
        fi
    else
        echo "❌ $file is missing"
    fi
done

# Check .dockerignore files
echo ""
echo "📁 Checking .dockerignore files..."

dockerignore_locations=("." "web" "app" "auth" "catalogos" "database")

for location in "${dockerignore_locations[@]}"; do
    if [ -f "$location/.dockerignore" ]; then
        echo "✅ $location/.dockerignore exists"
    else
        echo "❌ $location/.dockerignore is missing"
    fi
done

# Check environment templates
echo ""
echo "🔧 Checking environment variable templates..."

env_templates=(".env.development.template" ".env.staging.template" ".env.production.template")

for template in "${env_templates[@]}"; do
    if [ -f "$template" ]; then
        echo "✅ $template exists"
    else
        echo "❌ $template is missing"
    fi
done

# Check service-specific environment templates
service_dirs=("web" "app" "auth" "catalogos" "database")

for service in "${service_dirs[@]}"; do
    if [ -f "$service/.env.template" ]; then
        echo "✅ $service/.env.template exists"
    else
        echo "❌ $service/.env.template is missing"
    fi
done

echo ""
echo "🎯 Validation complete!"
echo ""
echo "Next steps:"
echo "1. Copy environment templates to actual .env files"
echo "2. Fill in the environment variables with your values"
echo "3. Test the Docker setup with: docker-compose up"