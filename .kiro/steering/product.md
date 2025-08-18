# Product Overview

This is a Chinook music database administration application - a restructured project that separates backend and frontend concerns into distinct micro services.

## Core Components

- **Chinook Admin App**: A Vue.js-based web interface for managing music catalog data
- **Backend Services**: Multiple Express.js microservices handling different domains:
  - Main app service (chinook-app)
  - Authentication service 
  - Catalog management service
- **Database Layer**: design database, data persistence and migrations with Knex.js (sqlite3 for dev stage and pg for staging stage)

## Purpose

The application provides administrative capabilities for managing a music database, likely including artists, albums, tracks, customers, and related catalog information. The architecture supports both development and production environments with proper authentication and CORS handling.