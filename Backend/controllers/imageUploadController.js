const query = require("../utils/dbQuery");

/* =============================
UPLOAD PROPERTY IMAGES
============================= */

exports.uploadPropertyImages = async (req,res,next)=>{

try{

const propertyId = req.params.property_id;

if(!req.files || req.files.length === 0){
return res.status(400).json({
success:false,
message:"No images uploaded"
});
}

/* verify property exists */

const property = await query(
"SELECT owner_id FROM properties WHERE property_id=$1",
[propertyId]
);

if(property.length === 0){
return res.status(404).json({
success:false,
message:"Property not found"
});
}

/* insert images */

const images = [];

for(const file of req.files){

const imagePath = `/uploads/properties/${file.filename}`;

await query(
"INSERT INTO property_images(property_id,image_url) VALUES($1,$2)",
[propertyId,imagePath]
);

images.push(imagePath);

}

res.json({
success:true,
message:"Images uploaded successfully",
images
});

}
catch(err){
next(err);
}

};