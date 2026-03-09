const db = require("../config/db");

// SAVE PROPERTY
exports.saveProperty = async (req, res, next) => {
  try {

    const { property_id } = req.body;

    if (!property_id) {
      return res.status(400).json({
        message: "Property ID required"
      });
    }

    // check if already saved
    const [existing] = await db.query(
      "SELECT id FROM saved_properties WHERE user_id = ? AND property_id = ?",
      [req.user.id, property_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Property already saved"
      });
    }

    await db.query(
      "INSERT INTO saved_properties (user_id, property_id) VALUES (?, ?)",
      [req.user.id, property_id]
    );

    res.status(201).json({
      message: "Property saved successfully"
    });

  } catch (err) {
    next(err);
  }
};


// GET SAVED PROPERTIES
exports.getSavedProperties = async (req, res, next) => {
  try {

    const [properties] = await db.query(`
      SELECT 
        p.property_id,
        p.title,
        p.city,
        p.price,
        p.type,
        p.status
      FROM saved_properties sp
      JOIN properties p ON sp.property_id = p.property_id
      WHERE sp.user_id = ?
    `, [req.user.id]);

    res.json(properties);

  } catch (err) {
    next(err);
  }
};


// REMOVE SAVED PROPERTY
exports.removeSavedProperty = async (req, res, next) => {
  try {

    const { property_id } = req.params;

    await db.query(
      "DELETE FROM saved_properties WHERE user_id = ? AND property_id = ?",
      [req.user.id, property_id]
    );

    res.json({
      message: "Saved property removed"
    });

  } catch (err) {
    next(err);
  }
};