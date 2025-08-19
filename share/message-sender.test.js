const MessageSender= require("./message-sender");
const { QUEUE_MAIL } = require('./sqs-config');

describe("MessageSender", () => {
    it("should create a queue", async () => {
        const sender = new MessageSender(QUEUE_MAIL);
        await sender.initialize();
        expect(sender.queueUrl).toBeDefined();
    });
    it("should send a message", async () => {
        const sender = new MessageSender(QUEUE_MAIL);
        await sender.initialize();
        await sender.sendMessage({ message: "Hello World" });
    });
});
