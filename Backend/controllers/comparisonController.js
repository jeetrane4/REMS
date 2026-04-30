const { query } = require("../utils/dbQuery");

/* ==============================
   COMPARE PROPERTIES
============================== */

exports.compareProperties = async (req, res, next) => {
  try {
    const { property_ids } = req.body;

    const properties = await query(
      `
      SELECT
        property_id,
        title,
        description,
        price,
        city,
        state,
        type,
        listing_type,
        bedrooms,
        bathrooms,
        area,
        address,
        latitude,
        longitude,
        status,
        verification_status,
        views
      FROM properties
      WHERE property_id = ANY($1::int[])
      ORDER BY property_id ASC
      `,
      [property_ids]
    );

    if (properties.length < 2) {
      return res.status(404).json({
        success: false,
        message: "At least 2 valid properties are required for comparison"
      });
    }

    const images = await query(
      `
      SELECT property_id, image_url
      FROM property_images
      WHERE property_id = ANY($1::int[])
      ORDER BY image_id ASC
      `,
      [property_ids]
    );

    const imageMap = {};

    images.forEach((img) => {
      if (!imageMap[img.property_id]) {
        imageMap[img.property_id] = [];
      }

      imageMap[img.property_id].push(img.image_url);
    });

    const result = properties.map((property) => ({
      ...property,
      images: imageMap[property.property_id] || []
    }));

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (err) {
    next(err);
  }
};