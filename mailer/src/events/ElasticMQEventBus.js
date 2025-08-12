const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { SQSClient, ReceiveMessageCommand } = require("@aws-sdk/client-sqs");
const IEventBus = require("./IEventBus");

class ElasticMQEventBus extends IEventBus {
  constructor(config) {
    super();
    this.sns = new SNSClient({
      endpoint: config.endpoint,
      region: config.region,
    });
    this.sqs = new SQSClient({
      endpoint: config.endpoint,
      region: config.region,
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
    };

    try {
      const data = await this.sqs.send(new ReceiveMessageCommand(params));
      if (data.Messages) {
        for (const message of data.Messages) {
          const body = JSON.parse(message.Body);
          await handler(body);
        }
      }
    } catch (error) {
      console.error("Error subscribing to ElasticMQ:", error);
    }
  }
}

module.exports = ElasticMQEventBus;
