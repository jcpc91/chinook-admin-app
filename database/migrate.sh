#!/bin/sh

# Determine database host based on environment
if [ "$NODE_ENV" = "test" ]; then
    DB_HOST=${DB_HOST:-postgres-test}
else
    DB_HOST=${DB_HOST:-postgres}
fi

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready at $DB_HOST:5432..."
dockerize -wait tcp://$DB_HOST:5432 -timeout 60s

# Check environment and set appropriate configuration
if [ "$NODE_ENV" = "test" ]; then
    echo "Running migrations for test environment..."
    KNEX_ENV="test"
    APP_DB_NAME=${DB_NAME_APP:-chinook_app_test}
    AUTH_DB_NAME=${DB_NAME_AUTH:-chinook_auth_test}
    CATALOGOS_DB_NAME=${DB_NAME_CATALOGOS:-chinook_catalogos_test}
elif [ "$NODE_ENV" = "staging" ]; then
    echo "Running migrations for staging environment..."
    KNEX_ENV="staging"
    APP_DB_NAME=${DB_NAME_APP:-chinook_app}
    AUTH_DB_NAME=${DB_NAME_AUTH:-chinook_auth}
    CATALOGOS_DB_NAME=${DB_NAME_CATALOGOS:-chinook_catalogos}
elif [ "$NODE_ENV" = "production" ]; then
    echo "Running migrations for production environment..."
    KNEX_ENV="production"
    APP_DB_NAME=${DB_NAME_APP:-chinook_app}
    AUTH_DB_NAME=${DB_NAME_AUTH:-chinook_auth}
    CATALOGOS_DB_NAME=${DB_NAME_CATALOGOS:-chinook_catalogos}
else
    echo "Unknown environment: $NODE_ENV. Defaulting to staging."
    KNEX_ENV="staging"
    APP_DB_NAME=${DB_NAME_APP:-chinook_app}
    AUTH_DB_NAME=${DB_NAME_AUTH:-chinook_auth}
    CATALOGOS_DB_NAME=${DB_NAME_CATALOGOS:-chinook_catalogos}
fi

# Run migrations for each service
if [ "$NODE_ENV" = "test" ]; then
    echo "Running app service migrations for database: $APP_DB_NAME..."
    npm run migrate-app-test

    echo "Running auth service migrations for database: $AUTH_DB_NAME..."
    npm run migrate-auth-test

    echo "Running catalogos service migrations for database: $CATALOGOS_DB_NAME..."
    npm run migrate-cat-test
else
    echo "Running app service migrations for database: $APP_DB_NAME..."
    DB_NAME=$APP_DB_NAME npx knex migrate:latest --env $KNEX_ENV --cwd app

    echo "Running auth service migrations for database: $AUTH_DB_NAME..."
    DB_NAME=$AUTH_DB_NAME npx knex migrate:latest --env $KNEX_ENV --cwd auth

    echo "Running catalogos service migrations for database: $CATALOGOS_DB_NAME..."
    DB_NAME=$CATALOGOS_DB_NAME npx knex migrate:latest --env $KNEX_ENV --cwd catalogos
fi

# Run seeds for auth service if they exist and not in test environment
if [ -d "auth/seeds" ] && [ "$NODE_ENV" != "test" ]; then
    echo "Running auth service seeds for database: $AUTH_DB_NAME..."
    DB_NAME=$AUTH_DB_NAME npx knex seed:run --env $KNEX_ENV --cwd auth
fi

echo "Database migrations completed successfully for $NODE_ENV environment!"