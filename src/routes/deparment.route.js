const express = require("express");
const router = express.Router();
const deparmentController = require("../controllers/deparment.controller");

router.post("/add-new", deparmentController.addNewDeparment);
router.patch("/update/:id", deparmentController.updateDeparment);
router.get("/get-all", deparmentController.getAllDeparment);
router.delete("/delete/:id", deparmentController.deleteDeparment);

module.exports = router;