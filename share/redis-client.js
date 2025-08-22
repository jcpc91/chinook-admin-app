const { createClient } = require('redis');

class RedisClient {
    constructor() {
        this.client = createClient({
            url: 'redis://localhost:6379'
        });
        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });
    }

    async connect() {
        await this.client.connect();
    }

    async disconnect() {
        await this.client.quit();
    }

    async set(key, value) {
        await this.client.set(key, value);
    }

    async get(key) {
        return await this.client.get(key);
    }

    async del(key) {
        await this.client.del(key);
    }
}
module.exports = RedisClient;
