# Multi-stage Dockerfile for Vue.js frontend

# Base stage with common dependencies
FROM node:24-alpine AS base

# Install system dependencies once
RUN apk add --no-cache curl dumb-init

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files first for better layer caching
COPY package*.json ./

# Development stage
FROM base AS development

# Install all dependencies (including dev dependencies) with optimized caching
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit

# Copy source code (this will be overridden by volume mount in development)
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose Vite dev server port
EXPOSE 5173

# Add health check for development
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5173/ || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "dev"]

# Test stage
FROM base AS test

# Install all dependencies including dev dependencies for testing
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit

# Install dockerize for consistency with backend services
RUN apk add --no-cache wget && \
    wget https://github.com/jwilder/dockerize/releases/download/v0.6.1/dockerize-alpine-linux-amd64-v0.6.1.tar.gz && \
    tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-v0.6.1.tar.gz && \
    rm dockerize-alpine-linux-amd64-v0.6.1.tar.gz

# Copy test configurations first (better layer caching)
COPY vitest.config.js vitest.config.container.js playwright.config.js ./

# Copy source code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Default command for test stage - run unit tests
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "test:unit:container", "--", "--run"]

# Production build stage
FROM base AS build

# Install all dependencies for building with optimized caching
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit

# Accept build arguments for environment variables
ARG VITE_MODE=production
ARG VITE_BASE_URL=http://app:3001
ARG VITE_URL_AUTH=http://auth:3000
ARG VITE_CATALOGOS_URL=http://catalogos:3002
ARG VITE_PORT=5173
ARG VITE_PREVIEW_PORT=4173
ARG VITE_USE_PROXY=false
ARG VITE_CORS_ORIGIN=http://web:80
ARG VITE_API_TIMEOUT=20000
ARG VITE_AUTH_TIMEOUT=10000
ARG VITE_ENABLE_DEBUG=false
ARG VITE_LOG_LEVEL=error
ARG VITE_SECURE_COOKIES=false
ARG VITE_ENABLE_HTTPS=false

# Set environment variables for build
ENV VITE_MODE=$VITE_MODE \
    VITE_BASE_URL=$VITE_BASE_URL \
    VITE_URL_AUTH=$VITE_URL_AUTH \
    VITE_CATALOGOS_URL=$VITE_CATALOGOS_URL \
    VITE_PORT=$VITE_PORT \
    VITE_PREVIEW_PORT=$VITE_PREVIEW_PORT \
    VITE_USE_PROXY=$VITE_USE_PROXY \
    VITE_CORS_ORIGIN=$VITE_CORS_ORIGIN \
    VITE_API_TIMEOUT=$VITE_API_TIMEOUT \
    VITE_AUTH_TIMEOUT=$VITE_AUTH_TIMEOUT \
    VITE_ENABLE_DEBUG=$VITE_ENABLE_DEBUG \
    VITE_LOG_LEVEL=$VITE_LOG_LEVEL \
    VITE_SECURE_COOKIES=$VITE_SECURE_COOKIES \
    VITE_ENABLE_HTTPS=$VITE_ENABLE_HTTPS

# Copy source code
COPY --chown=nodejs:nodejs . .

# Make environment injection script executable
RUN chmod +x scripts/inject-env.js

# Build the application
RUN npm run build

# Production stage - using nginx for better performance
FROM nginx:alpine AS production

# Install minimal dependencies for health checks and environment injection
RUN apk add --no-cache curl nodejs dumb-init

# Create non-root user for nginx
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy environment injection script
COPY --from=build /app/scripts/inject-env.js /usr/local/bin/inject-env.js
RUN chmod +x /usr/local/bin/inject-env.js

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create optimized startup script for environment injection
COPY <<EOF /docker-entrypoint.sh
#!/bin/sh
set -e
echo "🚀 Starting web service with environment injection..."
cd /usr/share/nginx/html
node /usr/local/bin/inject-env.js
echo "✅ Environment injection complete"
echo "🌐 Starting nginx..."
exec nginx -g "daemon off;"
EOF

RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--", "/docker-entrypoint.sh"]