const { query } = require("../utils/dbQuery");

const propertySelect = `
  SELECT
    p.*,
    (
      SELECT image_url
      FROM property_images
      WHERE property_id = p.property_id
      ORDER BY image_id ASC
      LIMIT 1
    ) AS image
  FROM properties p
`;

exports.getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.user_id || req.user.id;

    let properties = await query(
      `${propertySelect}
       JOIN user_preferences up ON up.user_id = $1
       WHERE p.verification_status = 'approved'
         AND (up.preferred_city IS NULL OR LOWER(p.city) = LOWER(up.preferred_city))
         AND (up.preferred_type IS NULL OR p.type = up.preferred_type)
         AND (up.min_budget IS NULL OR p.price >= up.min_budget)
         AND (up.max_budget IS NULL OR p.price <= up.max_budget)
       ORDER BY p.views DESC
       LIMIT 10`,
      [userId]
    );

    if (properties.length > 0) {
      return res.status(200).json({
        success: true,
        source: "preferences",
        count: properties.length,
        data: properties
      });
    }

    properties = await query(
      `${propertySelect}
       JOIN search_logs s ON s.user_id = $1
       WHERE p.verification_status = 'approved'
         AND s.city IS NOT NULL
         AND LOWER(p.city) = LOWER(s.city)
       ORDER BY s.created_at DESC, p.views DESC
       LIMIT 10`,
      [userId]
    );

    if (properties.length > 0) {
      return res.status(200).json({
        success: true,
        source: "search_logs",
        count: properties.length,
        data: properties
      });
    }

    properties = await query(
      `${propertySelect}
       WHERE p.verification_status = 'approved'
         AND p.city IN (
           SELECT DISTINCT p2.city
           FROM property_views v
           JOIN properties p2 ON v.property_id = p2.property_id
           WHERE v.user_id = $1 AND p2.city IS NOT NULL
         )
       ORDER BY p.views DESC
       LIMIT 10`,
      [userId]
    );

    if (properties.length > 0) {
      return res.status(200).json({
        success: true,
        source: "views",
        count: properties.length,
        data: properties
      });
    }

    properties = await query(
      `${propertySelect}
       WHERE p.verification_status = 'approved'
       ORDER BY p.views DESC, p.listed_at DESC
       LIMIT 10`
    );

    return res.status(200).json({
      success: true,
      source: "trending",
      count: properties.length,
      data: properties
    });
  } catch (err) {
    next(err);
  }
};