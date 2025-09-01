# Multi-stage Dockerfile for auth service
# Optimized for build performance and image size

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

# Install all dependencies with optimized caching
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit

# Copy source code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose port (default 3000, override with environment variable)
EXPOSE ${PORT:-3000}

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "dev"]

# Test stage
FROM base AS test

# Set test environment
ENV NODE_ENV=test

# Install all dependencies including dev dependencies for testing
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit

# Install dockerize for waiting on database
RUN apk add --no-cache wget && \
    wget https://github.com/jwilder/dockerize/releases/download/v0.6.1/dockerize-alpine-linux-amd64-v0.6.1.tar.gz && \
    tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-v0.6.1.tar.gz && \
    rm dockerize-alpine-linux-amd64-v0.6.1.tar.gz

# Copy test configurations first (better layer caching)
COPY jest.config.js jest.config.container.js ./

# Copy source code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Default command for test stage - wait for database then run tests
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "dockerize -wait tcp://${DB_HOST:-postgres-test}:${DB_PORT:-5432} -timeout 60s && npm run test:container"]

# Production stage
FROM base AS production

# Install only production dependencies with optimized caching
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --prefer-offline --no-audit && \
    npm cache clean --force

# Copy source code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE ${PORT:-3000}

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]