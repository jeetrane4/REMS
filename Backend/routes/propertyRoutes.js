const router = require("express").Router();
const controller = require("../controllers/propertyController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/", controller.getProperties);
router.get("/:id", controller.getPropertyById);
router.post("/", auth, role(["seller", "agent", "admin"]), controller.createProperty);
router.put("/:id", auth, role(["seller", "agent", "admin"]), controller.updateProperty);
router.delete("/:id", auth, role(["seller", "agent", "admin"]), controller.deleteProperty);

module.exports = router;