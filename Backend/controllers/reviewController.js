const { query } = require("../utils/dbQuery");

exports.addReview = async (req, res, next) => {
  try {
    const { property_id, rating, comment } = req.body;
    const userId = req.user.user_id || req.user.id;

    const property = await query(
      "SELECT property_id, owner_id FROM properties WHERE property_id = $1",
      [property_id]
    );

    if (property.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    if (property[0].owner_id === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot review your own property"
      });
    }

    const rows = await query(
      `INSERT INTO reviews (property_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [property_id, userId, rating, comment || null]
    );

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: rows[0]
    });
  } catch (err) {
    next(err);
  }
};

exports.getPropertyReviews = async (req, res, next) => {
  try {
    const { property_id } = req.params;

    const reviews = await query(
      `SELECT
        r.review_id,
        r.property_id,
        r.user_id,
        r.rating,
        r.comment,
        r.created_at,
        u.user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.property_id = $1
       ORDER BY r.created_at DESC`,
      [property_id]
    );

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    next(err);
  }
};