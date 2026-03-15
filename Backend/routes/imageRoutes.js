const router = require("express").Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploadMiddleware");

const controller = require("../controllers/imageUploadController");

/* =========================
UPLOAD PROPERTY IMAGES
========================= */

router.post(
"/:property_id",
protect,
authorize(["seller","agent","admin"]),
upload.array("images",10),
controller.uploadPropertyImages
);

module.exports = router;