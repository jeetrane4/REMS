const query = require("../utils/dbQuery");

/* =============================
UPLOAD PROPERTY DOCUMENT
============================= */

exports.uploadPropertyDocument = async (req,res,next)=>{

try{

const property_id = req.params.property_id;
const { document_type, document_url } = req.body;

if(!document_type || !document_url){
return res.status(400).json({
success:false,
message:"Document type and URL required"
});
}

await query(
`INSERT INTO property_documents(property_id,document_type,document_url)
VALUES($1,$2,$3)`,
[property_id,document_type,document_url]
);

res.status(201).json({
success:true,
message:"Property document uploaded"
});

}
catch(err){
next(err);
}

};


/* =============================
GET PROPERTY DOCUMENTS
============================= */

exports.getPropertyDocuments = async (req,res,next)=>{

try{

const property_id = req.params.property_id;

const documents = await query(
`SELECT *
FROM property_documents
WHERE property_id=$1`,
[property_id]
);

res.json({
success:true,
count:documents.length,
data:documents
});

}
catch(err){
next(err);
}

};