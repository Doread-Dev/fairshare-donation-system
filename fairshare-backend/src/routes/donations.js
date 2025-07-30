const express = require("express");
const router = express.Router();
const donationsController = require("../controllers/donationsController");
const { auth } = require("../middleware/auth");

router.get("/", donationsController.getAllDonations);
router.get("/:id", donationsController.getDonationById);
router.post("/", auth, donationsController.createDonation);
router.put("/:id", auth, donationsController.updateDonation);
router.delete("/:id", auth, donationsController.deleteDonation);

module.exports = router;
