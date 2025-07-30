const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { auth } = require("../middleware/auth");

router.use(auth);

router.get("/summary", dashboardController.getSummary);

module.exports = router;
