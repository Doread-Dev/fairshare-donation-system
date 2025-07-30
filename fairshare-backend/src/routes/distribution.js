const express = require("express");
const router = express.Router();
const distributionController = require("../controllers/distributionController");
const { auth } = require("../middleware/auth");

router.post("/suggest", auth, distributionController.suggestDistribution);
router.post("/execute", auth, distributionController.executeDistribution);

module.exports = router;

