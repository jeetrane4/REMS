const router = require("express").Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploadMiddleware");

const controller = require("../controllers/imageUploadController");

router.post(
"/:property_id",
auth,
role(["seller","agent","admin"]),
upload.array("images",10),
controller.uploadPropertyImages
);

module.exports = router;