const knex = require('knex');

// Health check function for database connectivity
async function checkDatabaseHealth(config) {
    let connection;
    try {
        connection = knex(config);

        // Test the connection
        await connection.raw('SELECT 1');

        console.log(`✓ Database connection successful for ${config.connection.database}`);
        return true;
    } catch (error) {
        console.error(`✗ Database connection failed for ${config.connection.database}:`, error.message);
        return false;
    } finally {
        if (connection) {
            await connection.destroy();
        }
    }
}

// Check all database connections
async function checkAllDatabases() {
    const environment = process.env.NODE_ENV || 'staging';

    const appConfig = require('./app/knexfile.js')[environment];
    const authConfig = require('./auth/knexfile.js')[environment];
    const catalogosConfig = require('./catalogos/knexfile.js')[environment];

    console.log(`Checking database health for ${environment} environment...`);

    const results = await Promise.all([
        checkDatabaseHealth(appConfig),
        checkDatabaseHealth(authConfig),
        checkDatabaseHealth(catalogosConfig)
    ]);

    const allHealthy = results.every(result => result);

    if (allHealthy) {
        console.log('✓ All databases are healthy');
        process.exit(0);
    } else {
        console.log('✗ Some databases are unhealthy');
        process.exit(1);
    }
}

// Run health check if called directly
if (require.main === module) {
    checkAllDatabases().catch(error => {
        console.error('Health check failed:', error);
        process.exit(1);
    });
}

module.exports = { checkDatabaseHealth, checkAllDatabases };
