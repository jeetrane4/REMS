const { query } = require("../utils/dbQuery");

/* ==============================
   MAP SEARCH
============================== */

exports.searchNearbyProperties = async (req, res, next) => {
  try {
    const {
      lat,
      lng,
      radius = 5,
      type
    } = req.query;

    let sql = `
      SELECT *
      FROM (
        SELECT
          p.property_id,
          p.title,
          p.price,
          p.city,
          p.state,
          p.address,
          p.type,
          p.listing_type,
          p.latitude,
          p.longitude,
          (
            6371 * acos(
              cos(radians($1::numeric)) *
              cos(radians(p.latitude::numeric)) *
              cos(radians(p.longitude::numeric) - radians($2::numeric)) +
              sin(radians($1::numeric)) *
              sin(radians(p.latitude::numeric))
            )
          ) AS distance,
          (
            SELECT image_url
            FROM property_images
            WHERE property_id = p.property_id
            ORDER BY image_id ASC
            LIMIT 1
          ) AS image
        FROM properties p
        WHERE p.verification_status = 'approved'
          AND p.latitude IS NOT NULL
          AND p.longitude IS NOT NULL
      ) nearby
      WHERE distance <= $3::numeric
    `;

    const params = [lat, lng, radius];
    let index = 4;

    if (type) {
      sql += ` AND type = $${index++}`;
      params.push(type);
    }

    sql += " ORDER BY distance ASC";

    const properties = await query(sql, params);

    return res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (err) {
    next(err);
  }
};