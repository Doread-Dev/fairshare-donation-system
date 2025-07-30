const express = require("express");
const router = express.Router();
const materialsController = require("../controllers/materialsController");
const { auth, authorizeRoles } = require("../middleware/auth");

router.use(auth);

router.get("/", materialsController.getAllMaterials);
router.get('/critical', materialsController.getCriticalMaterials);
router.get('/categories', materialsController.getCategories);
router.get("/:id", materialsController.getMaterialById);
router.post("/", authorizeRoles("admin"), materialsController.createMaterial);
router.put("/:id", authorizeRoles("admin"), materialsController.updateMaterial);
router.delete(
  "/:id",
  authorizeRoles("admin"),
  materialsController.deleteMaterial
);

module.exports = router;
