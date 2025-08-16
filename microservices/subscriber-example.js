const MessageSubscriber = require('./message-subscriber');
//const MailMessageSubscriber = require('./mail-message-subscriber');

async function runSubscriber() {
    console.log('📥 Starting Message Subscriber Example...\n');

    const subscriber = new MessageSubscriber();

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
