-- Create databases for each service
CREATE DATABASE chinook_app;
CREATE DATABASE chinook_auth;
CREATE DATABASE chinook_catalogos;

-- Create user and grant permissions
CREATE USER chinook_user WITH PASSWORD 'secure_password';

-- Grant all privileges on databases to the user
GRANT ALL PRIVILEGES ON DATABASE chinook_app TO chinook_user;
GRANT ALL PRIVILEGES ON DATABASE chinook_auth TO chinook_user;
GRANT ALL PRIVILEGES ON DATABASE chinook_catalogos TO chinook_user;

-- Connect to each database and grant schema permissions
\c chinook_app;
GRANT ALL ON SCHEMA public TO chinook_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO chinook_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO chinook_user;

\c chinook_auth;
GRANT ALL ON SCHEMA public TO chinook_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO chinook_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO chinook_user;

\c chinook_catalogos;
GRANT ALL ON SCHEMA public TO chinook_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO chinook_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO chinook_user;