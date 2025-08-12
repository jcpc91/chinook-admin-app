class IEventBus {
    constructor() {
      if (this.constructor === IEventBus) {
        throw new Error("Can't instantiate abstract class!");
      }
    }

    async publish(topic, message) {
      throw new Error("Method 'publish()' must be implemented.");
    }

    async subscribe(topic, handler) {
      throw new Error("Method 'subscribe()' must be a function.");
    }
  }

  module.exports = IEventBus;
