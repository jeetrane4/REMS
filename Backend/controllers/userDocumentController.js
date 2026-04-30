const { query } = require("../utils/dbQuery");

/* =============================
   UPLOAD USER DOCUMENT
============================= */

exports.uploadUserDocument = async (req, res, next) => {
  try {
    const { document_type } = req.body;
    const userId = req.user.user_id || req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Document file is required"
      });
    }

    const documentUrl = `/uploads/documents/${req.file.filename}`;

    const rows = await query(
      `INSERT INTO user_documents
       (user_id, document_type, document_url)
       VALUES ($1, $2, $3)
       RETURNING id, document_type, document_url, status`,
      [userId, document_type, documentUrl]
    );

    return res.status(201).json({
      success: true,
      message: "User document uploaded successfully",
      data: rows[0]
    });
  } catch (err) {
    next(err);
  }
};

/* =============================
   GET USER DOCUMENTS
============================= */

exports.getUserDocuments = async (req, res, next) => {
  try {
    const userId = req.user.user_id || req.user.id;

    const docs = await query(
      `SELECT
        id,
        document_type,
        document_url,
        status,
        created_at
       FROM user_documents
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      count: docs.length,
      data: docs
    });
  } catch (err) {
    next(err);
  }
};