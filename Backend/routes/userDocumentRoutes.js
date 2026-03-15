const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const controller = require("../controllers/userDocumentController");

/* =========================
UPLOAD DOCUMENT
========================= */

router.post("/", protect, controller.uploadUserDocument);

/* =========================
GET USER DOCUMENTS
========================= */

router.get("/", protect, controller.getUserDocuments);

module.exports = router;