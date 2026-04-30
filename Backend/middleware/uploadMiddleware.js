const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* =============================
   CREATE UPLOAD DIRECTORIES
============================= */

const baseUploadDir = path.join(process.cwd(), "Backend", "uploads");
const propertyUploadDir = path.join(baseUploadDir, "properties");
const documentUploadDir = path.join(baseUploadDir, "documents");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDir(baseUploadDir);
ensureDir(propertyUploadDir);
ensureDir(documentUploadDir);

/* =============================
   STORAGE
============================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isDocument =
      file.fieldname === "document" || file.fieldname === "documents";

    const targetDir = isDocument ? documentUploadDir : propertyUploadDir;

    ensureDir(targetDir);

    cb(null, targetDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    const safeOriginalName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .toLowerCase();

    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}-${safeOriginalName}`;

    cb(null, uniqueName + ext);
  }
});

/* =============================
   FILE FILTER
============================= */

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf"
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(
    new Error("Only JPEG, PNG, WEBP images and PDF documents are allowed"),
    false
  );
};

/* =============================
   UPLOAD CONFIG
============================= */

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;