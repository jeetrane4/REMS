const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const controller = require("../controllers/propertyDocumentController");

/* =========================
UPLOAD DOCUMENT
========================= */

router.post(
"/:property_id",
protect,
authorize(["seller","agent","admin"]),
controller.uploadPropertyDocument
);

/* =========================
GET DOCUMENTS
========================= */

router.get(
"/:property_id",
protect,
authorize(["seller","agent","admin"]),
controller.getPropertyDocuments
);

module.exports = router;