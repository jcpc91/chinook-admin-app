const AWS = require('aws-sdk');

// Configure AWS SDK for ElasticMQ
const sqs = new AWS.SQS({
    endpoint: 'http://localhost:9324',
    region: 'elasticmq',
    accessKeyId: 'x',
    secretAccessKey: 'x'
});

const QUEUE_NAME = 'hello-world-queue';

// Sender class
class MessageSender {
    constructor() {
        this.queueUrl = null;
    }

    async initialize() {
        try {
            console.log('📝 Sender: Creating queue...');
            const result = await sqs.createQueue({
                QueueName: QUEUE_NAME
            }).promise();

            this.queueUrl = result.QueueUrl;
            console.log('✅ Sender: Queue ready:', this.queueUrl);
        } catch (error) {
            console.error('❌ Sender: Failed to initialize:', error.message);
            throw error;
        }
    }

    async sendMessage(message) {
        if (!this.queueUrl) {
            throw new Error('Sender not initialized. Call initialize() first.');
        }

        try {
            console.log('📤 Sender: Sending message...', message);

            await sqs.sendMessage({
                QueueUrl: this.queueUrl,
                MessageBody: JSON.stringify({
                    ...message,
                    timestamp: new Date().toISOString(),
                    senderId: 'hello-world-sender'
                })
            }).promise();

            console.log('✅ Sender: Message sent successfully');
        } catch (error) {
            console.error('❌ Sender: Failed to send message:', error.message);
            throw error;
        }
    }
}

// Subscriber class
class MessageSubscriber {
    constructor() {
        this.queueUrl = null;
        this.isListening = false;
    }

    async initialize() {
        try {
            console.log('📝 Subscriber: Getting queue URL...');
            const result = await sqs.getQueueUrl({
                QueueName: QUEUE_NAME
            }).promise();

            this.queueUrl = result.QueueUrl;
            console.log('✅ Subscriber: Connected to queue:', this.queueUrl);
        } catch (error) {
            console.error('❌ Subscriber: Failed to initialize:', error.message);
            throw error;
        }
    }

    async receiveMessage() {
        if (!this.queueUrl) {
            throw new Error('Subscriber not initialized. Call initialize() first.');
        }

        try {
            console.log('📥 Subscriber: Polling for messages...');

            const result = await sqs.receiveMessage({
                QueueUrl: this.queueUrl,
                MaxNumberOfMessages: 1,
                WaitTimeSeconds: 5 // Long polling
            }).promise();

            if (result.Messages && result.Messages.length > 0) {
                const message = result.Messages[0];
                const body = JSON.parse(message.Body);

                console.log('✅ Subscriber: Message received:', body);

                // Process the message (simulate work)
                await this.processMessage(body);

                // Delete the message after processing
                await sqs.deleteMessage({
                    QueueUrl: this.queueUrl,
                    ReceiptHandle: message.ReceiptHandle
                }).promise();

                console.log('🗑️ Subscriber: Message processed and deleted');
                return body;
            } else {
                console.log('📭 Subscriber: No messages available');
                return null;
            }
        } catch (error) {
            console.error('❌ Subscriber: Failed to receive message:', error.message);
            throw error;
        }
    }

    async processMessage(messageBody) {
        // Simulate message processing
        console.log('⚙️ Subscriber: Processing message...', messageBody.message);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate work
        console.log('✨ Subscriber: Message processed successfully');
    }

    async startListening(maxMessages = 5) {
        this.isListening = true;
        let messageCount = 0;

        console.log(`🎧 Subscriber: Starting to listen (max ${maxMessages} messages)...`);

        while (this.isListening && messageCount < maxMessages) {
            try {
                const message = await this.receiveMessage();
                if (message) {
                    messageCount++;
                }

                // Small delay between polls
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error('❌ Subscriber: Error while listening:', error.message);
                break;
            }
        }

        console.log(`🛑 Subscriber: Stopped listening after ${messageCount} messages`);
    }

    stopListening() {
        this.isListening = false;
        console.log('🛑 Subscriber: Stop signal sent');
    }
}

// Hello World Test Function
async function helloWorldTest() {
    console.log('🚀 Starting Hello World Sender/Subscriber Test...\n');

    const sender = new MessageSender();
    const subscriber = new MessageSubscriber();

    try {
        // Initialize sender and subscriber
        await sender.initialize();
        await subscriber.initialize();

        console.log('\n--- Phase 1: Send some hello world messages ---');

        // Send multiple hello world messages
        const messages = [
            { message: 'Hello World!' },
            { message: 'Greetings from the sender!' },
            { message: 'This is message #3' },
            { message: 'Final hello world message' }
        ];

        for (const msg of messages) {
            await sender.sendMessage(msg);
            await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
        }

        console.log('\n--- Phase 2: Subscribe and process messages ---');

        // Start subscriber (will process all messages)
        await subscriber.startListening(messages.length);

        console.log('\n🎉 Hello World Test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    helloWorldTest();
}

module.exports = { MessageSender, MessageSubscriber, helloWorldTest };