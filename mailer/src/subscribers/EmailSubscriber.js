class EmailSubscriber {
    constructor(eventBus, mailer) {
      this.eventBus = eventBus;
      this.mailer = mailer;
    }

    subscribeToUserRegistered() {
      this.eventBus.subscribe("user_registered", (message) => {
        this.handleUserRegistered(message);
      });
    }

    handleUserRegistered(message) {
      const { to, subject, body } = message;
      this.mailer.send(to, subject, body);
    }
  }

  module.exports = EmailSubscriber;
