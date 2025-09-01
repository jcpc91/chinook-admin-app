-- Create test databases for each service
CREATE DATABASE chinook_app_test;
CREATE DATABASE chinook_auth_test;
CREATE DATABASE chinook_catalogos_test;

-- Create test user and grant permissions (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'test_user') THEN
        CREATE USER test_user WITH PASSWORD 'test_password';
    END IF;
END
$$;

-- Grant all privileges on test databases to the test user
GRANT ALL PRIVILEGES ON DATABASE chinook_app_test TO test_user;
GRANT ALL PRIVILEGES ON DATABASE chinook_auth_test TO test_user;
GRANT ALL PRIVILEGES ON DATABASE chinook_catalogos_test TO test_user;

-- Connect to each test database and grant schema permissions
\c chinook_app_test;
GRANT ALL ON SCHEMA public TO test_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO test_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO test_user;

\c chinook_auth_test;
GRANT ALL ON SCHEMA public TO test_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO test_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO test_user;

\c chinook_catalogos_test;
GRANT ALL ON SCHEMA public TO test_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO test_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO test_user;