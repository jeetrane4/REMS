const query = require("../utils/dbQuery");

/* =============================
UPLOAD USER DOCUMENT
============================= */

exports.uploadUserDocument = async (req,res,next)=>{

try{

const { document_type, document_url } = req.body;

if(!document_type || !document_url){
return res.status(400).json({
success:false,
message:"Document type and URL required"
});
}

await query(
`INSERT INTO user_documents(user_id,document_type,document_url)
VALUES($1,$2,$3)`,
[req.user.id,document_type,document_url]
);

res.status(201).json({
success:true,
message:"User document uploaded"
});

}
catch(err){
next(err);
}

};


/* =============================
GET USER DOCUMENTS
============================= */

exports.getUserDocuments = async (req,res,next)=>{

try{

const docs = await query(
`SELECT *
FROM user_documents
WHERE user_id=$1`,
[req.user.id]
);

res.json({
success:true,
count:docs.length,
data:docs
});

}
catch(err){
next(err);
}

};