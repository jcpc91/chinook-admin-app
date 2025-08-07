const express = require("express");
const router = express.Router();
const passport = require("passport");
const { isAdmin } = require("../middelware/rolles.js");
const EmployeeService = require("../../../repository/service/EmployeeService.js");
const EmployeeRepository = require("../../../repository/sqliteRepository/EmployeeRepository.js");

const repository = new EmployeeService(new EmployeeRepository());

router.get("/", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
  repository
    .getAllEmployees()
    .then((employees) => {
      res.json(employees);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});
router.get("/:id", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
  repository
    .getEmployeeById(parseInt(req.params.id))
    .then((employee) => {
      res.json(employee);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

router.post("/", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
  repository
    .createEmployee(req.body)
    .then((employee) => {
      res.json(employee);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

router.put("/", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
  repository
    .updateEmployee(req.body.id, req.body)
    .then((employee) => {
        if(!employee)
            return res.status(404).json({ error: "Employee not found" });
      res.json(employee);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});
module.exports = router;
