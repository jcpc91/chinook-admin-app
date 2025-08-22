
const RedisClient  = require('./redis-client');

describe("RedisClient", () => {

    it("should connect to the client", async () => {
        const client = new RedisClient();
        await client.connect();
        expect(client).toBeDefined();
        await client.disconnect();
    });
    it('shoud send a message', async () => {
        const client = new RedisClient();
        await client.connect();
        await client.set('test', 'test');
        const testvalue = await client.get('test')
        expect(client).toBeDefined();
        expect(testvalue).toBe('test');
        await client.disconnect();
    });
});
