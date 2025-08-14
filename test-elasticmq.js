const AWS = require('aws-sdk');

// Configure AWS SDK for ElasticMQ
const sqs = new AWS.SQS({
  endpoint: 'http://localhost:9324',
  region: 'elasticmq',
  accessKeyId: 'x',
  secretAccessKey: 'x'
});

async function testElasticMQ() {
  try {
    console.log('🚀 Testing ElasticMQ connection...');
    
    // Create a test queue
    const queueName = 'hello-world-queue';
    console.log(`📝 Creating queue: ${queueName}`);
    
    const createQueueResult = await sqs.createQueue({
      QueueName: queueName
    }).promise();
    
    console.log('✅ Queue created:', createQueueResult.QueueUrl);
    
    // Send a hello world message
    console.log('📤 Sending hello world message...');
    
    await sqs.sendMessage({
      QueueUrl: createQueueResult.QueueUrl,
      MessageBody: JSON.stringify({
        message: 'Hello World from ElasticMQ!',
        timestamp: new Date().toISOString()
      })
    }).promise();
    
    console.log('✅ Message sent successfully');
    
    // Receive the message
    console.log('📥 Receiving messages...');
    
    const receiveResult = await sqs.receiveMessage({
      QueueUrl: createQueueResult.QueueUrl,
      MaxNumberOfMessages: 1
    }).promise();
    
    if (receiveResult.Messages && receiveResult.Messages.length > 0) {
      const message = receiveResult.Messages[0];
      console.log('✅ Message received:', JSON.parse(message.Body));
      
      // Delete the message
      await sqs.deleteMessage({
        QueueUrl: createQueueResult.QueueUrl,
        ReceiptHandle: message.ReceiptHandle
      }).promise();
      
      console.log('🗑️ Message deleted');
    }
    
    // List queues
    console.log('📋 Listing all queues...');
    const listResult = await sqs.listQueues().promise();
    console.log('✅ Available queues:', listResult.QueueUrls);
    
    console.log('🎉 ElasticMQ connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing ElasticMQ:', error.message);
    process.exit(1);
  }
}

testElasticMQ();