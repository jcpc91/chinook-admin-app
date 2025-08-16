const MessageSender = require('../share/message-sender');
const { QUEUE_MAIL } = require('../share/sqs-config');

async function runSender() {
    console.log('📤 Starting Message Sender Example...\n');

    const sender = new MessageSender(QUEUE_MAIL);

    try {
        await sender.initialize();

        // Send individual messages
        await sender.sendMessage({ from:'test@localhost', to:'test@localhost', subject:'test', text:'test', html:'test' });
        await sender.sendMessage({ from:'test1@localhost', to:'test1@localhost', subject:'test1', text:'test1', html:'test1' });

        // Send a batch of messages
        const batchMessages = [
            { from:'test2@localhost', to:'test2@localhost', subject:'test2', text:'test2', html:'test2' },
            { from:'test3@localhost', to:'test3@localhost', subject:'test3', text:'test3', html:'test3' },
            { from:'test4@localhost', to:'test4@localhost', subject:'test4', text:'test4', html:'test4' }
        ];

        await sender.sendBatch(batchMessages);

        console.log('\n✅ Sender example completed!');

    } catch (error) {
        console.error('❌ Sender failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    runSender();
}
