const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const { auth, authorizeRoles } = require("../middleware/auth");

router.use(auth);

router.get("/", authorizeRoles("admin"), usersController.getAllUsers);
router.get("/:id", usersController.getUserById);
router.post("/", authorizeRoles("admin"), usersController.createUser);
router.put("/:id", authorizeRoles("admin"), usersController.updateUser);
router.delete("/:id", authorizeRoles("admin"), usersController.deleteUser);

module.exports = router;
