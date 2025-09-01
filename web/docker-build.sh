#!/bin/bash

# Docker build script for web service with environment-specific configurations

set -e

ENVIRONMENT=${1:-development}
IMAGE_NAME="chinook-web"

echo "Building web service for environment: $ENVIRONMENT"

case $ENVIRONMENT in
  "development"|"dev")
    echo "Building development image..."
    docker build --target development -t ${IMAGE_NAME}:dev .
    echo "Development image built successfully: ${IMAGE_NAME}:dev"
    ;;
  
  "staging")
    echo "Building staging image..."
    docker build --target production \
      --build-arg VITE_MODE=staging \
      --build-arg VITE_BASE_URL=http://app:3001 \
      --build-arg VITE_URL_AUTH=http://auth:3000 \
      -t ${IMAGE_NAME}:staging .
    echo "Staging image built successfully: ${IMAGE_NAME}:staging"
    ;;
  
  "production"|"prod")
    echo "Building production image..."
    docker build --target production \
      --build-arg VITE_MODE=production \
      --build-arg VITE_BASE_URL=http://app:3001 \
      --build-arg VITE_URL_AUTH=http://auth:3000 \
      -t ${IMAGE_NAME}:prod .
    echo "Production image built successfully: ${IMAGE_NAME}:prod"
    ;;
  
  *)
    echo "Usage: $0 [development|staging|production]"
    echo "Default: development"
    exit 1
    ;;
esac

echo "Build completed successfully!"