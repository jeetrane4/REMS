const express = require("express");
const router = express.Router();

const controller = require("../controllers/propertyController");
const protect = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

/* =========================
PUBLIC PROPERTY ROUTES
========================= */

router.get("/", controller.getProperties);

router.get("/:id", controller.getPropertyById);

/* =========================
CREATE PROPERTY
========================= */

router.post(
  "/",
  protect,
  role(["seller","agent","admin"]),
  controller.createProperty
);

/* =========================
UPDATE PROPERTY
========================= */

router.put(
  "/:id",
  protect,
  role(["seller","agent","admin"]),
  controller.updateProperty
);

/* =========================
DELETE PROPERTY
========================= */

router.delete(
  "/:id",
  protect,
  role(["seller","agent","admin"]),
  controller.deleteProperty
);

/* =========================
ADMIN VERIFY PROPERTY
========================= */

router.put(
  "/:id/verify",
  protect,
  role(["admin"]),
  async (req,res,next)=>{
    try{

      const db = require("../config/db");

      const { status } = req.body;

      await db.query(
        "UPDATE properties SET verification_status=? WHERE property_id=?",
        [status,req.params.id]
      );

      res.json({
        message:"Property verification updated"
      });

    }catch(err){
      next(err);
    }
  }
);

module.exports = router;