const db = require("../config/db");

/* =============================
CREATE PROPERTY
============================= */

exports.createProperty = async (req, res, next) => {
  try {
    const { title, description, price, city, state, address, type } = req.body;

    await db.query(
      `INSERT INTO properties 
      (title, description, price, city, state, address, type, owner_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, price, city, state, address, type, req.user.id]
    );

    res.status(201).json({
      message: "Property created successfully"
    });

  } catch (err) {
    next(err);
  }
};


/* =============================
GET ALL PROPERTIES
============================= */

exports.getProperties = async (req, res, next) => {
  try {

    const { city, type, minPrice, maxPrice } = req.query;

    let query = `
      SELECT 
        p.*, 
        u.user_name AS owner_name,
        pi.image_url AS image
      FROM properties p
      JOIN users u ON p.owner_id = u.user_id
      LEFT JOIN property_images pi 
      ON p.property_id = pi.property_id
      WHERE 1=1
    `;

    const params = [];

    if (city) {
      query += " AND p.city = ?";
      params.push(city);
    }

    if (type) {
      query += " AND p.type = ?";
      params.push(type);
    }

    if (minPrice) {
      query += " AND p.price >= ?";
      params.push(minPrice);
    }

    if (maxPrice) {
      query += " AND p.price <= ?";
      params.push(maxPrice);
    }

    const [properties] = await db.query(query, params);

    res.json(properties);

  } catch (err) {
    next(err);
  }
};


/* =============================
GET PROPERTY BY ID
============================= */

exports.getPropertyById = async (req, res, next) => {
  try {

    const [rows] = await db.query(
      `SELECT 
        p.*, 
        u.user_name AS owner_name,
        pi.image_url AS image
      FROM properties p
      JOIN users u ON p.owner_id = u.user_id
      LEFT JOIN property_images pi
      ON p.property_id = pi.property_id
      WHERE p.property_id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Property not found"
      });
    }

    res.json(rows[0]);

  } catch (err) {
    next(err);
  }
};


/* =============================
UPDATE PROPERTY
============================= */

exports.updateProperty = async (req, res, next) => {
  try {

    const { title, description, price, city, state, address, type } = req.body;

    await db.query(
      `UPDATE properties
       SET title=?, description=?, price=?, city=?, state=?, address=?, type=?
       WHERE property_id=?`,
      [title, description, price, city, state, address, type, req.params.id]
    );

    res.json({
      message: "Property updated successfully"
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

    await db.query(
      "DELETE FROM properties WHERE property_id=?",
      [req.params.id]
    );

    res.json({
      message: "Property deleted successfully"
    });

  } catch (err) {
    next(err);
  }
};