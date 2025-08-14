const { sqs, QUEUE_NAME } = require('./share/sqs-config');

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

    async sendBatch(messages) {
        if (!this.queueUrl) {
            throw new Error('Sender not initialized. Call initialize() first.');
        }

        console.log(`📤 Sender: Sending batch of ${messages.length} messages...`);
        
        for (const msg of messages) {
            await this.sendMessage(msg);
            await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
        }
        
        console.log('✅ Sender: Batch sent successfully');
    }
}

module.exports = MessageSender;