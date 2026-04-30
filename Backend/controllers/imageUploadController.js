const { query } = require("../utils/dbQuery");

/* =============================
   UPLOAD PROPERTY IMAGES
============================= */

exports.uploadPropertyImages = async (req, res, next) => {
  try {
    const propertyId = req.params.property_id;
    const loggedInUserId = req.user.user_id || req.user.id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images uploaded"
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

    if (propertyRows[0].owner_id !== loggedInUserId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to upload images for this property"
      });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const imagePath = `/uploads/properties/${file.filename}`;

      const rows = await query(
        `INSERT INTO property_images (property_id, image_url)
         VALUES ($1, $2)
         RETURNING image_id, image_url`,
        [propertyId, imagePath]
      );

      uploadedImages.push(rows[0]);
    }

    return res.status(201).json({
      success: true,
      message: "Images uploaded successfully",
      images: uploadedImages
    });
  } catch (err) {
    next(err);
  }
};