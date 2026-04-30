const { query } = require("../utils/dbQuery");

/* =============================
   CREATE PROPERTY
============================= */

exports.createProperty = async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      city,
      state,
      address,
      pincode,
      type,
      listing_type,
      bedrooms,
      bathrooms,
      area,
      amenities,
      latitude,
      longitude
    } = req.body;

    const rows = await query(
      `INSERT INTO properties
       (
        title, description, price, city, state, address, pincode,
        type, listing_type, bedrooms, bathrooms, area, amenities,
        latitude, longitude, owner_id
       )
       VALUES
       ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [
        title,
        description || null,
        price,
        city,
        state || null,
        address || null,
        pincode || null,
        type,
        listing_type || "sale",
        bedrooms || 0,
        bathrooms || 0,
        area || null,
        amenities ? JSON.stringify(amenities) : JSON.stringify([]),
        latitude || null,
        longitude || null,
        req.user.user_id || req.user.id
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Property created successfully",
      data: rows[0]
    });
  } catch (err) {
    next(err);
  }
};

/* =============================
   GET PROPERTIES
============================= */

exports.getProperties = async (req, res, next) => {
  try {
    const {
      city,
      type,
      listing_type,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const offset = (pageNumber - 1) * limitNumber;

    let whereClause = "WHERE p.verification_status = 'approved'";
    const params = [];
    let index = 1;

    if (city) {
      whereClause += ` AND LOWER(p.city) = LOWER($${index++})`;
      params.push(city);
    }

    if (type) {
      whereClause += ` AND p.type = $${index++}`;
      params.push(type);
    }

    if (listing_type) {
      whereClause += ` AND p.listing_type = $${index++}`;
      params.push(listing_type);
    }

    if (minPrice) {
      whereClause += ` AND p.price >= $${index++}`;
      params.push(minPrice);
    }

    if (maxPrice) {
      whereClause += ` AND p.price <= $${index++}`;
      params.push(maxPrice);
    }

    const dataQuery = `
      SELECT
        p.*,
        u.user_name AS owner_name,
        (
          SELECT image_url
          FROM property_images
          WHERE property_id = p.property_id
          ORDER BY image_id ASC
          LIMIT 1
        ) AS image
      FROM properties p
      JOIN users u ON p.owner_id = u.user_id
      ${whereClause}
      ORDER BY p.listed_at DESC
      LIMIT $${index++}
      OFFSET $${index++}
    `;

    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM properties p
      JOIN users u ON p.owner_id = u.user_id
      ${whereClause}
    `;

    const dataParams = [...params, limitNumber, offset];

    const properties = await query(dataQuery, dataParams);
    const countRows = await query(countQuery, params);

    return res.status(200).json({
      success: true,
      count: properties.length,
      total: countRows[0].total,
      page: pageNumber,
      pages: Math.ceil(countRows[0].total / limitNumber),
      data: properties
    });
  } catch (err) {
    next(err);
  }
};

/* =============================
   GET PROPERTY DETAILS
============================= */

exports.getPropertyById = async (req, res, next) => {
  try {
    const propertyId = req.params.id;

    const rows = await query(
      `SELECT
        p.*,
        u.user_name AS owner_name,
        u.user_email AS owner_email,
        u.user_mobile AS owner_mobile
       FROM properties p
       JOIN users u ON p.owner_id = u.user_id
       WHERE p.property_id = $1`,
      [propertyId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    await query(
      "UPDATE properties SET views = views + 1 WHERE property_id = $1",
      [propertyId]
    );

    const images = await query(
      "SELECT image_id, image_url FROM property_images WHERE property_id = $1 ORDER BY image_id ASC",
      [propertyId]
    );

    const documents = await query(
      `SELECT id, document_type, document_url, status
       FROM property_documents
       WHERE property_id = $1`,
      [propertyId]
    );

    const property = rows[0];
    property.views = Number(property.views || 0) + 1;
    property.images = images;
    property.documents = documents;

    return res.status(200).json({
      success: true,
      data: property
    });
  } catch (err) {
    next(err);
  }
};

/* =============================
   UPDATE PROPERTY
============================= */

exports.updateProperty = async (req, res, next) => {
  try {
    const propertyId = req.params.id;

    const existing = await query(
      "SELECT owner_id FROM properties WHERE property_id = $1",
      [propertyId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    const loggedInUserId = req.user.user_id || req.user.id;

    if (existing[0].owner_id !== loggedInUserId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this property"
      });
    }

    const allowedFields = [
      "title",
      "description",
      "price",
      "city",
      "state",
      "address",
      "pincode",
      "type",
      "listing_type",
      "bedrooms",
      "bathrooms",
      "area",
      "amenities",
      "latitude",
      "longitude",
      "status"
    ];

    const updates = [];
    const values = [];
    let index = 1;

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates.push(`${field} = $${index++}`);
        values.push(
          field === "amenities"
            ? JSON.stringify(req.body[field] || [])
            : req.body[field]
        );
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update"
      });
    }

    values.push(propertyId);

    const rows = await query(
      `UPDATE properties
       SET ${updates.join(", ")}
       WHERE property_id = $${index}
       RETURNING *`,
      values
    );

    return res.status(200).json({
      success: true,
      message: "Property updated successfully",
      data: rows[0]
    });
  } catch (err) {
    next(err);
  }
};

/* =============================
   DELETE PROPERTY
============================= */

exports.deleteProperty = async (req, res, next) => {
  try {
    const propertyId = req.params.id;

    const existing = await query(
      "SELECT owner_id FROM properties WHERE property_id = $1",
      [propertyId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    const loggedInUserId = req.user.user_id || req.user.id;

    if (existing[0].owner_id !== loggedInUserId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this property"
      });
    }

    await query(
      "DELETE FROM properties WHERE property_id = $1",
      [propertyId]
    );

    return res.status(200).json({
      success: true,
      message: "Property deleted successfully"
    });
  } catch (err) {
    next(err);
  }
};

/* =============================
   ADMIN VERIFY PROPERTY
============================= */

exports.verifyProperty = async (req, res, next) => {
  try {
    const { status } = req.body;
    const propertyId = req.params.id;

    const rows = await query(
      `UPDATE properties
       SET verification_status = $1
       WHERE property_id = $2
       RETURNING property_id, verification_status`,
      [status, propertyId]
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
   GET MY PROPERTIES
============================= */

exports.getMyProperties = async (req, res, next) => {
  try {
    const userId = req.user.user_id || req.user.id;

    const properties = await query(
      `SELECT
        p.*,
        u.user_name AS owner_name,
        (
          SELECT image_url
          FROM property_images
          WHERE property_id = p.property_id
          ORDER BY image_id ASC
          LIMIT 1
        ) AS image
       FROM properties p
       JOIN users u ON p.owner_id = u.user_id
       WHERE p.owner_id = $1
       ORDER BY p.listed_at DESC`,
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