const express = require("express");
const router = express.Router();

const controller = require("../controllers/propertyController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const query = require("../utils/dbQuery");

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
authorize(["seller","agent","admin"]),
controller.createProperty
);



/* =========================
UPDATE PROPERTY
========================= */

router.put(
"/:id",
protect,
authorize(["seller","agent","admin"]),
controller.updateProperty
);



/* =========================
DELETE PROPERTY
========================= */

router.delete(
"/:id",
protect,
authorize(["seller","agent","admin"]),
controller.deleteProperty
);



/* =========================
ADMIN VERIFY PROPERTY
========================= */

router.put(
"/:id/verify",
protect,
authorize(["admin"]),
async (req,res,next)=>{

try{

const { status } = req.body;

await query(
"UPDATE properties SET verification_status=$1 WHERE property_id=$2",
[status,req.params.id]
);

res.json({
success:true,
message:"Property verification updated"
});

}
catch(err){
next(err);
}

}
);

module.exports = router;