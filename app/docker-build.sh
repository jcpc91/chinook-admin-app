#!/bin/bash

# Build script for chinook-app service container
# Usage: ./docker-build.sh [environment] [tag]

ENVIRONMENT=${1:-development}
TAG=${2:-latest}
SERVICE_NAME="chinook-app"

echo "Building ${SERVICE_NAME} container for ${ENVIRONMENT} environment..."

# Build the container with the specified target stage
docker build \
  --target ${ENVIRONMENT} \
  --tag ${SERVICE_NAME}:${ENVIRONMENT}-${TAG} \
  --build-arg PORT=3001 \
  .

if [ $? -eq 0 ]; then
    echo "✅ Successfully built ${SERVICE_NAME}:${ENVIRONMENT}-${TAG}"
    echo ""
    echo "To run the container:"
    echo "docker run -p 3001:3001 --env-file .env.${ENVIRONMENT} ${SERVICE_NAME}:${ENVIRONMENT}-${TAG}"
else
    echo "❌ Build failed"
    exit 1
fi