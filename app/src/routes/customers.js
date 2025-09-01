const express = require("express");
const router = express.Router();
const passport = require("passport");
const { isAdmin } = require("../../../share/middelware/rolles.js");
const CustomerService = require("../../../database/repository/service/CustomerService.js");
const AppDatabaseFactory = require("../../../database/repository/AppDatabaseFactory.js");

const repository = new CustomerService(AppDatabaseFactory.createCustomerRepository());

router.get("/", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
  repository
    .getCustomers()
    .then((customers) => {
      res.json(customers);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

router.post("/", passport.authenticate('jwt', {session: false}), isAdmin, (req, res) => {
    repository.createCustomer(req.body)
    .then((data) => res.json(data))
    .catch(err => res.status(500).json({error: err.message}))
})
module.exports = router;
