const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* =============================
CREATE UPLOAD DIRECTORY
============================= */

const uploadDir = "uploads/properties";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* =============================
STORAGE
============================= */

const storage = multer.diskStorage({

destination: function(req,file,cb){
cb(null, uploadDir);
},

filename: function(req,file,cb){

const unique =
Date.now() +
"-" +
Math.round(Math.random()*1E9);

cb(null, unique + path.extname(file.originalname));

}

});

/* =============================
FILE FILTER
============================= */

const fileFilter = (req,file,cb)=>{

const allowed = [
"image/jpeg",
"image/png",
"image/webp"
];

if(allowed.includes(file.mimetype)){
cb(null,true);
}else{
cb(new Error("Only JPEG, PNG, WEBP images allowed"),false);
}

};

/* =============================
UPLOAD CONFIG
============================= */

const upload = multer({
storage,
fileFilter,
limits:{
fileSize:5*1024*1024
}
});

module.exports = upload;