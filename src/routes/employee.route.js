const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employee.controller");

router.post("/add-new", employeeController.addNewEmployee);
router.patch("/update/:id", employeeController.updateEmployee);
router.get("/get-all", employeeController.getAllEmployee);
router.get("/get-by-id/:id", employeeController.getEmployeeById);
router.delete("/delete/:id", employeeController.deleteEmployee);

module.exports = router;