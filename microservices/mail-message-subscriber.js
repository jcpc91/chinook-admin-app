/**
 * microservice to receive messages from SQS and send emails
 */
const { sqs, QUEUE_MAIL } = require('../share/sqs-config');
const {nodemailer, sendMail} = require('../share/mail.mock')
class MailMessageSubscriber {
    constructor() {
        this.queueUrl = null;
        this.isListening = false;
    }
    async initialize() {
        try {
            console.log(`📝 Subscriber: Getting queue URL for ${QUEUE_MAIL}...`);
            try {
                const result = await sqs.getQueueUrl({ QueueName: QUEUE_MAIL }).promise();
                this.queueUrl = result.QueueUrl;
            } catch (error) {
                if (error.code === 'QueueDoesNotExist') {
                    console.log(`⚠️ Queue ${QUEUE_MAIL} not found. Creating...`);
                    const result = await sqs.createQueue({ QueueName: QUEUE_MAIL }).promise();
                    this.queueUrl = result.QueueUrl;
                    console.log(`✅ Queue created with URL: ${this.queueUrl}`);
                } else {
                    throw error;
                }
            }

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
        console.log('⚙️ Subscriber: Processing message...', messageBody);
        await sendMail(messageBody)
        //await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate work
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

    async listenContinuously() {
        this.isListening = true;
        console.log('🎧 Subscriber: Starting continuous listening...');

        while (this.isListening) {
            try {
                await this.receiveMessage();
                // Small delay between polls
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error('❌ Subscriber: Error while listening:', error.message);
                break;
            }
        }

        console.log('🛑 Subscriber: Stopped continuous listening');
    }

    stopListening() {
        this.isListening = false;
        console.log('🛑 Subscriber: Stop signal sent');
    }
}


async function runSubscriber() {
    console.log('📥 Starting Message Subscriber Example...\n');

    const subscriber = new MailMessageSubscriber();

    try {
        await subscriber.initialize();

        console.log('Listening modes available:');
        console.log('1. Limited messages: startListening(number)');
        console.log('2. Continuous: listenContinuously() - Ctrl+C to stop');

        // Listen for more messages (change number as needed)
        //await subscriber.startListening(20); // Listen for 20 messages

        // Or listen continuously (uncomment line below)
        await subscriber.listenContinuously();

        console.log('\n✅ Subscriber example completed!');

    } catch (error) {
        console.error('❌ Subscriber failed:', error.message);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

if (require.main === module) {
    runSubscriber();
}
