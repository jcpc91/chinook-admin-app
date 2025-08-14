const MessageSender = require('./message-sender');

async function runSender() {
    console.log('📤 Starting Message Sender Example...\n');
    
    const sender = new MessageSender();
    
    try {
        await sender.initialize();
        
        // Send individual messages
        await sender.sendMessage({ message: 'Hello from standalone sender!' });
        await sender.sendMessage({ message: 'Another message', data: { id: 123, type: 'test' } });
        
        // Send a batch of messages
        const batchMessages = [
            { message: 'Batch message 1' },
            { message: 'Batch message 2' },
            { message: 'Batch message 3' }
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