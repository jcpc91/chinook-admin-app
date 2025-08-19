const { sqsClient } = require('./sqs-config');
const { CreateQueueCommand, SendMessageCommand } = require('@aws-sdk/client-sqs');

class MessageSender {
    constructor(queuename) {
        this.queueUrl = null;
        this.QueueName = queuename
    }

    async initialize() {
        try {
            console.log('📝 Sender: Creating queue...');
            const command = new CreateQueueCommand({
                QueueName: this.QueueName
            });
            const result = await sqsClient.send(command);
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

            const command = new SendMessageCommand({
                QueueUrl: this.queueUrl,
                MessageBody: JSON.stringify({
                    ...message,
                    timestamp: new Date().toISOString(),
                    senderId: 'hello-world-sender'
                })
            });
            await sqsClient.send(command);

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
