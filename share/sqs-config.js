const AWS = require('aws-sdk');

// Configure AWS SDK for ElasticMQ
const sqs = new AWS.SQS({
    endpoint: 'http://localhost:9324',
    region: 'elasticmq',
    accessKeyId: 'x',
    secretAccessKey: 'x'
});

const QUEUE_NAME = 'hello-world-queue';
const QUEUE_MAIL = "mail-sender-queue"
module.exports = { sqs, QUEUE_NAME, QUEUE_MAIL };