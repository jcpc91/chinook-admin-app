const express = require("express");
const router = express.Router();
const passport = require("passport");
const { isAdmin } = require("../../../share/middelware/rolles.js");
const CustomerService = require("../../../database/repository/service/CustomerService.js");
const CustomerRepository = require("../../../database/repository/sqliteRepository/CustomerRepository.js");

const service = new CustomerService(new CustomerRepository());

router.get("/", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
  service
    .getCustomers()
    .then((customers) => {
      res.json(customers);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

router.post("/", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
  service
    .createCustomer(req.body)
    .then((data) => res.json(data))
    .catch((err) => res.status(500).json({ error: err.message }));
});
module.exports = router;
