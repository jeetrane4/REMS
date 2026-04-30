const { query } = require("../utils/dbQuery");

/* =============================
   SAVE PROPERTY
============================= */

exports.saveProperty = async (req, res, next) => {
  try {
    const { property_id } = req.body;
    const userId = req.user.user_id || req.user.id;

    const property = await query(
      "SELECT property_id FROM properties WHERE property_id = $1",
      [property_id]
    );

    if (property.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    const existing = await query(
      `SELECT id
       FROM saved_properties
       WHERE user_id = $1 AND property_id = $2`,
      [userId, property_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Property already saved"
      });
    }

    const rows = await query(
      `INSERT INTO saved_properties (user_id, property_id)
       VALUES ($1, $2)
       RETURNING id`,
      [userId, property_id]
    );

    return res.status(201).json({
      success: true,
      message: "Property saved successfully",
      data: rows[0]
    });
  } catch (err) {
    next(err);
  }
};

/* =============================
   GET SAVED PROPERTIES
============================= */

exports.getSavedProperties = async (req, res, next) => {
  try {
    const userId = req.user.user_id || req.user.id;

    const properties = await query(
      `
      SELECT
        p.property_id,
        p.title,
        p.city,
        p.price,
        p.type,
        p.status,
        (
          SELECT image_url
          FROM property_images
          WHERE property_id = p.property_id
          ORDER BY image_id ASC
          LIMIT 1
        ) AS image
      FROM saved_properties sp
      JOIN properties p ON sp.property_id = p.property_id
      WHERE sp.user_id = $1
      ORDER BY p.listed_at DESC
      `,
      [userId]
    );

    return res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (err) {
    next(err);
  }
};

/* =============================
   REMOVE SAVED PROPERTY
============================= */

exports.removeSavedProperty = async (req, res, next) => {
  try {
    const { property_id } = req.params;
    const userId = req.user.user_id || req.user.id;

    const rows = await query(
      `DELETE FROM saved_properties
       WHERE user_id = $1 AND property_id = $2
       RETURNING id`,
      [userId, property_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Saved property not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Saved property removed successfully"
    });
  } catch (err) {
    next(err);
  }
};