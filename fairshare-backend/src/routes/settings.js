const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");
const { auth } = require("../middleware/auth");

router.use(auth);

router.get("/", settingsController.getSettings);
router.put("/", settingsController.updateSettings);

module.exports = router;
