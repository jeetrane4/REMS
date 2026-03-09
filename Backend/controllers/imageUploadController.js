const db = require("../config/db");

exports.uploadPropertyImages = async (req,res,next)=>{

try{

const propertyId = req.params.property_id;

if(!req.files || req.files.length === 0){
return res.status(400).json({
message:"No images uploaded"
});
}

const images = req.files.map(file=>{

return [propertyId, `/uploads/properties/${file.filename}`];

});

await db.query(
"INSERT INTO property_images (property_id,image_url) VALUES ?",
[images]
);

res.json({
message:"Images uploaded successfully"
});

}catch(err){
next(err);
}

};