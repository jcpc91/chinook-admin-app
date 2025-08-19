
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { SQSClient, ReceiveMessageCommand, GetQueueUrlCommand, CreateQueueCommand, DeleteMessageCommand } = require("@aws-sdk/client-sqs");
const IEventBus = require("./IEventBus");

class ElasticMQEventBus extends IEventBus {
  constructor(config) {
    super();
    const credentials = {
      accessKeyId: 'x',
      secretAccessKey: 'x'
    };

    this.sns = new SNSClient({
      endpoint: config.endpoint,
      region: config.region,
      credentials: credentials,
      forcePathStyle: true,

    });

    this.sqs = new SQSClient({
      endpoint: config.endpoint,
      region: config.region,
      credentials: credentials,
      forcePathStyle: true
    });
    this.queueUrl = config.queueUrl;
  }



  async publish(topic, message) {
    const params = {
      TopicArn: topic,
      Message: JSON.stringify(message),
    };

    try {

      await this.sns.send(new PublishCommand(params));
    } catch (error) {
      console.error("Error publishing message to ElasticMQ:", error);
    }
  }

  async subscribe(topic, handler) {
    const params = {
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
      MessageAttributeNames: ['All'],
      AttributeNames: ['All']
    };

    const processMessages = async () => {
      try {
        const data = await this.sqs.send(new ReceiveMessageCommand(params));

        if (data.Messages && data.Messages.length > 0) {
          for (const message of data.Messages) {
            try {
              // Parse the message body (which is a stringified JSON)
              const body = JSON.parse(message.Body);

              // Handle SNS messages (they have a different structure)
              const messageContent = body.Message ? JSON.parse(body.Message) : body;

              // Call the handler with the message content
              await handler(messageContent);

              // Delete the message from the queue after successful processing
              await this.sqs.send(new DeleteMessageCommand({
                QueueUrl: this.queueUrl,
                ReceiptHandle: message.ReceiptHandle
              }));
            } catch (processError) {
              console.error('Error processing message:', processError);
              // Continue with the next message even if one fails
              continue;
            }
          }
        }

        // Continue polling for more messages
        setImmediate(processMessages);
      } catch (error) {
        console.error("Error receiving messages from ElasticMQ:", error);
        // Wait a bit before retrying in case of errors
        setTimeout(processMessages, 5000);
      }
    };

    // Start the polling
    processMessages();
  }
}

module.exports = ElasticMQEventBus;
