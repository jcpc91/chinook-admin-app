const { createClient } = require('redis');

async function testRedisConnection() {
    // Create a new Redis client
    const client = createClient({
        url: 'redis://localhost:6379' // Default Redis port
    });

    // Handle connection errors
    client.on('error', (err) => {
        console.error('Redis Client Error:', err);
    });

    try {
        // Connect to the Redis server
        await client.connect();
        console.log('Successfully connected to Redis');

        // Test set and get
        await client.set('test_key', 'Hello, Redis!');
        const value = await client.get('test_key');
        console.log('Retrieved value:', value);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close the connection when done
        await client.quit();
        console.log('Redis connection closed');
    }
}

// Run the test
testRedisConnection();
