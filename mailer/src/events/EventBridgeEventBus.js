const { EventBridgeClient, PutEventsCommand } = require("@aws-sdk/client-eventbridge");
const IEventBus = require("./IEventBus");

class EventBridgeEventBus extends IEventBus {
  constructor(config) {
    super();
    this.eventBridge = new EventBridgeClient({
      region: config.region,
    });
    this.eventBusName = config.eventBusName;
  }

  async publish(source, detailType, detail) {
    const params = {
      Entries: [
        {
          Source: source,
          DetailType: detailType,
          Detail: JSON.stringify(detail),
          EventBusName: this.eventBusName,
        },
      ],
    };

    try {
      await this.eventBridge.send(new PutEventsCommand(params));
    } catch (error) {
      console.error("Error publishing event to EventBridge:", error);
    }
  }

  async subscribe(topic, handler) {
    // Subscription is handled by AWS EventBridge rules
    console.warn("Subscription is not handled in code for EventBridge.");
  }
}

module.exports = EventBridgeEventBus;
