const express = require("express");
const router = express.Router();
const familiesController = require("../controllers/familiesController");
const { auth } = require("../middleware/auth");

router.get("/", familiesController.getAllFamilies);
router.get("/:id", familiesController.getFamilyById);
router.get("/:id/distributions", familiesController.getFamilyDistributions);
router.post("/", auth, familiesController.createFamily);
router.put("/:id", auth, familiesController.updateFamily);
router.delete("/:id", auth, familiesController.deleteFamily);

module.exports = router;
