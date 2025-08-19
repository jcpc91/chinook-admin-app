const { SQSClient } = require('@aws-sdk/client-sqs');

// Configure AWS SDK v3 for ElasticMQ
const sqsClient = new SQSClient({
    endpoint: 'http://localhost:9324',
    region: 'elasticmq',
    credentials: {
        accessKeyId: 'x',
        secretAccessKey: 'x'
    }
});

const QUEUE_NAME = 'hello-world-queue';
const QUEUE_MAIL = "mail-sender-queue";

module.exports = { sqsClient, QUEUE_NAME, QUEUE_MAIL };