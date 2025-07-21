const express = require("express");
const router = express.Router();
const passport = require("passport");
const EmployeeService = require("../../repositories/service/EmployeeService.js");
const JsonFileEmployeeRepository = require("../../repositories/jsonRepository/employee.js");
const EmployeeRepository = require("../../repositories/sqliteRepository/EmployeeRepository.js");

const repository = new EmployeeService(new EmployeeRepository());

router.get("/", passport.authenticate("jwt", { session: false }), (req, res) => {
  repository
    .getAllEmployees()
    .then((employees) => {
      res.json(employees);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});
router.get("/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
  repository
    .getEmployeeById(parseInt(req.params.id))
    .then((employee) => {
      res.json(employee);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

router.post("/", passport.authenticate("jwt", { session: false }), (req, res) => {
  repository
    .createEmployee(req.body)
    .then((employee) => {
      res.json(employee);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

router.put("/", passport.authenticate("jwt", { session: false }), (req, res) => {
  repository
    .updateEmployee(req.body.EmployeeId, req.body)
    .then((employee) => {
      res.json(employee);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});
module.exports = router;
