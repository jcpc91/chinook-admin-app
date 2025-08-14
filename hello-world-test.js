const MessageSender = require('./message-sender');
const MessageSubscriber = require('./message-subscriber');

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

        await sender.sendBatch(messages);

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

module.exports = { helloWorldTest };