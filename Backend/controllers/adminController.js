const { query } = require("../utils/dbQuery");

/* =============================
   VERIFY PROPERTY
============================= */

exports.verifyProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const rows = await query(
      `UPDATE properties
       SET verification_status = $1
       WHERE property_id = $2
       RETURNING property_id, verification_status`,
      [status || "approved", id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Property verification updated successfully",
      data: rows[0]
    });
  } catch (err) {
    next(err);
  }
};

/* =============================
   GET ALL PROPERTIES (ADMIN)
============================= */

exports.getAllProperties = async (req, res, next) => {
  try {
    const properties = await query(`
      SELECT
        p.*,
        u.user_name AS owner_name,
        u.user_email AS owner_email,
        (
          SELECT image_url
          FROM property_images
          WHERE property_id = p.property_id
          ORDER BY image_id ASC
          LIMIT 1
        ) AS image
      FROM properties p
      JOIN users u ON p.owner_id = u.user_id
      ORDER BY p.listed_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllUserDocuments = async (req, res, next) => {
  try {
    const docs = await query(`
      SELECT
        ud.id,
        ud.user_id,
        u.user_name,
        ud.document_type,
        ud.document_url,
        ud.status
      FROM user_documents ud
      JOIN users u ON ud.user_id = u.user_id
      ORDER BY ud.id DESC
    `);

    res.json({
      success: true,
      count: docs.length,
      data: docs
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyUserDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document status"
      });
    }

    const rows = await query(
      `UPDATE user_documents
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User document not found"
      });
    }

    res.json({
      success: true,
      message: "User document verification updated",
      data: rows[0]
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllPropertyDocuments = async (req, res, next) => {
  try {
    const docs = await query(`
      SELECT
        pd.id,
        pd.property_id,
        p.title,
        pd.document_type,
        pd.document_url,
        pd.status
      FROM property_documents pd
      JOIN properties p ON pd.property_id = p.property_id
      ORDER BY pd.id DESC
    `);

    res.json({
      success: true,
      count: docs.length,
      data: docs
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyPropertyDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document status"
      });
    }

    const rows = await query(
      `UPDATE property_documents
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Property document not found"
      });
    }

    res.json({
      success: true,
      message: "Property document verification updated",
      data: rows[0]
    });
  } catch (err) {
    next(err);
  }
};