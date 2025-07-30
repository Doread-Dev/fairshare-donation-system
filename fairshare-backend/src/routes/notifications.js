const express = require("express");
const router = express.Router();
const notificationsController = require("../controllers/notificationsController");
const { auth } = require("../middleware/auth");

router.use(auth);

router.get("/", notificationsController.getNotifications);
router.put("/:id/read", notificationsController.markAsRead);

module.exports = router;
