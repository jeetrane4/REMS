const { query } = require("../utils/dbQuery");

/* =============================
   UPLOAD PROPERTY DOCUMENT
============================= */

exports.uploadPropertyDocument = async (req, res, next) => {
  try {
    const propertyId = req.params.property_id;
    const { document_type } = req.body;
    const userId = req.user.user_id || req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Document file is required"
      });
    }

    const propertyRows = await query(
      "SELECT owner_id FROM properties WHERE property_id = $1",
      [propertyId]
    );

    if (propertyRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    if (propertyRows[0].owner_id !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to upload documents for this property"
      });
    }

    const documentUrl = `/uploads/documents/${req.file.filename}`;

    const rows = await query(
      `INSERT INTO property_documents
       (property_id, document_type, document_url)
       VALUES ($1, $2, $3)
       RETURNING id, property_id, document_type, document_url, status`,
      [propertyId, document_type, documentUrl]
    );

    return res.status(201).json({
      success: true,
      message: "Property document uploaded successfully",
      data: rows[0]
    });
  } catch (err) {
    next(err);
  }
};

/* =============================
   GET PROPERTY DOCUMENTS
============================= */

exports.getPropertyDocuments = async (req, res, next) => {
  try {
    const propertyId = req.params.property_id;
    const userId = req.user.user_id || req.user.id;

    const propertyRows = await query(
      "SELECT owner_id FROM properties WHERE property_id = $1",
      [propertyId]
    );

    if (propertyRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    if (propertyRows[0].owner_id !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view documents for this property"
      });
    }

    const documents = await query(
      `SELECT
        id,
        property_id,
        document_type,
        document_url,
        status
       FROM property_documents
       WHERE property_id = $1
       ORDER BY id DESC`,
      [propertyId]
    );

    return res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (err) {
    next(err);
  }
};