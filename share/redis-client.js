const { createClient } = require('redis');

class RedisClient {
    constructor() {
        this.client = createClient({
            url: 'redis://localhost:6379'
        });
        this.client.on('connect', () => {
            console.log('Redis Client Connected');
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

    /**
     * Set a key with a value and an expiration time of 1 hour
     * @param {string} key
     * @param {string} value
     */
    async set(key, value) {
        await this.client.set(key, value);
        await this.client.expire(key, 60 * 60 * 60);
    }

    /**
     *
     * @param {string} key
     * @returns {string}
     */
    async get(key) {
        return await this.client.get(key);
    }

    async del(key) {
        await this.client.del(key);
    }
}
module.exports = RedisClient;
