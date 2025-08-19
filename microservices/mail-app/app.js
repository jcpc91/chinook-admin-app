
const eventBusFactory = require('./events/EventBusFactory');
const EmailSubscriber = require('./subscribers/EmailSubscriber');
const ConsoleMailer = require('./services/ConsoleMailer');


// Set the event bus type
process.env.EVENT_BUS_TYPE = 'elasticmq';

// Configuration
const config = {
  elasticmq: {
    endpoint: 'http://localhost:9324',
    region: 'elasticmq',
    queueUrl: '/mail-sender-queue',
  },
  eventbridge: {
    region: 'us-east-1',
    eventBusName: 'default',
  },
};


async function runSubscriber() {
  try {
    // Create and initialize the event bus
    const eventBus = eventBusFactory(config);

    // Initialize the event bus (creates queue if needed)
    //await eventBus.initialize();

    // Create the mailer
    const mailer = new ConsoleMailer();

    // Create the subscriber
    const emailSubscriber = new EmailSubscriber(eventBus, mailer);

    // Start the subscriber
    emailSubscriber.subscribeToUserRegistered();

    console.log('Mailer service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize mailer service:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

if (require.main === module) {
    runSubscriber();
}
