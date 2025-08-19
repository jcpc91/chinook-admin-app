const ElasticMQEventBus = require("./ElasticMQEventBus");
const EventBridgeEventBus = require("./EventBridgeEventBus");

const eventBusFactory = (config) => {
  if (process.env.EVENT_BUS_TYPE === "elasticmq") {
    return new ElasticMQEventBus(config.elasticmq);
  } else if (process.env.EVENT_BUS_TYPE === "eventbridge") {
    return new EventBridgeEventBus(config.eventbridge);
  } else {
    throw new Error("No event bus type specified");
  }
};

module.exports = eventBusFactory;
