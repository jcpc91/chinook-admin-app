const express = require('express');
const eventBusFactory = require('./events/EventBusFactory');
const EmailSubscriber = require('./subscribers/EmailSubscriber');
const ConsoleMailer = require('./services/ConsoleMailer');

const app = express();
const port = 3004;

// Set the event bus type
process.env.EVENT_BUS_TYPE = 'elasticmq';

// Configuration
const config = {
  elasticmq: {
    endpoint: 'http://localhost:9324',
    region: 'us-east-1',
    queueUrl: 'http://localhost:9324/queue/default',
  },
  eventbridge: {
    region: 'us-east-1',
    eventBusName: 'default',
  },
};

// Create the event bus
const eventBus = eventBusFactory(config);

// Create the mailer
const mailer = new ConsoleMailer();

// Create the subscriber
const emailSubscriber = new EmailSubscriber(eventBus, mailer);

// Start the subscriber
emailSubscriber.subscribeToUserRegistered();

app.get('/', (req, res) => {
  res.send('Mailer microservice is running!');
});

app.listen(port, () => {
  console.log(`Mailer microservice listening at http://localhost:${port}`);
});
