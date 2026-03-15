// =============================
// REVIEW MODULE
// =============================

document.addEventListener("DOMContentLoaded", initReviews);

let propertyId = null;

/* =============================
INIT
============================= */

function initReviews(){

const params = new URLSearchParams(window.location.search);

propertyId = params.get("id");

if(!propertyId) return;

loadReviews();
initReviewForm();

}


/* =============================
LOAD REVIEWS
============================= */

async function loadReviews(){

const container = document.getElementById("reviewList");

if(!container) return;

try{

const reviews = await apiRequest(`/reviews/${propertyId}`);

if(!reviews || reviews.length === 0){

container.innerHTML = `
<p class="muted-text">No reviews yet.</p>
`;

return;

}

container.innerHTML = reviews.map(r => `

<div class="review-card">

<strong>${escapeHTML(r.user_name)}</strong>

<div class="review-rating">
${"⭐".repeat(r.rating)}
</div>

<p>${escapeHTML(r.comment)}</p>

<span class="review-date">
${formatDate(r.created_at)}
</span>

</div>

`).join("");

}
catch(err){

console.error(err);

}

}


/* =============================
SUBMIT REVIEW
============================= */

function initReviewForm(){

const form = document.getElementById("reviewForm");

if(!form) return;

form.addEventListener("submit", async e => {

e.preventDefault();

const data = Object.fromEntries(new FormData(form));

data.property_id = propertyId;

try{

await apiRequest("/reviews","POST",data);

notify("Review submitted","success");

form.reset();

loadReviews();

}
catch(err){

console.error(err);

notify("Failed to submit review","error");

}

});

}


/* =============================
UTILS
============================= */

function formatDate(date){

return new Date(date).toLocaleDateString();

}

function escapeHTML(str){

return str?.replace(/[&<>"']/g,function(m){

return({

"&":"&amp;",
"<":"&lt;",
">":"&gt;",
'"':"&quot;",
"'":"&#39;"

})[m];

});

}