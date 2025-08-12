const express = require("express");
const router = express.Router();
const eventBusFactory = require("../events/EventBusFactory");
const ValidUserRepository = require("../../../database/repository/sqliteRepository/ValidUserRepository");
const ValidUserService = require('../../../database/repository/service/ValidUserService');

const validuser = new ValidUserService(new ValidUserRepository());

// Configuration
const config = {
  elasticmq: {
    endpoint: "http://localhost:9324",
    region: "us-east-1",
    queueUrl: "http://localhost:9324/queue/default",
  },
  eventbridge: {
    region: "us-east-1",
    eventBusName: "default",
  },
};

// Create the event bus
const eventBus = eventBusFactory(config);

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const user = await validuser.createUser(username, password);
  if (user) {
    // Publish user registered event
    await eventBus.publish("user_registered", {
      to: user.username,
      subject: "Welcome to our platform",
      body: "Thank you for registering",
    });
    res.status(201).json({ message: "User created successfully" });
  } else {
    res.status(400).json({ message: "User already exists" });
  }
});

module.exports = router;
