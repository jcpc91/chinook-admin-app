-- E2E Test Database Initialization Script
-- Creates separate databases for each service in E2E testing environment

-- Create E2E databases
CREATE DATABASE chinook_auth_e2e;
CREATE DATABASE chinook_app_e2e;
CREATE DATABASE chinook_catalogos_e2e;

-- Grant permissions to e2e_user
GRANT ALL PRIVILEGES ON DATABASE chinook_auth_e2e TO e2e_user;
GRANT ALL PRIVILEGES ON DATABASE chinook_app_e2e TO e2e_user;
GRANT ALL PRIVILEGES ON DATABASE chinook_catalogos_e2e TO e2e_user;

-- Connect to each database and grant schema permissions
\c chinook_auth_e2e;
GRANT ALL ON SCHEMA public TO e2e_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO e2e_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO e2e_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO e2e_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO e2e_user;

\c chinook_app_e2e;
GRANT ALL ON SCHEMA public TO e2e_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO e2e_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO e2e_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO e2e_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO e2e_user;

\c chinook_catalogos_e2e;
GRANT ALL ON SCHEMA public TO e2e_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO e2e_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO e2e_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO e2e_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO e2e_user;

-- Return to main database
\c chinook_e2e;