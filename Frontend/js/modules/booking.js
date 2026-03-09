// =============================
// BOOKING MODULE
// =============================

document.addEventListener("DOMContentLoaded", () => {

initBookingFromPage();

const container = document.getElementById("bookingList");

if(container){
loadBookings();
}

});

/* =============================
INIT BOOKING FROM PROPERTY PAGE
============================= */

function initBookingFromPage(){

const btn = document.getElementById("bookVisitBtn");

if(!btn) return;

const params = new URLSearchParams(window.location.search);

const propertyId = params.get("id");

if(!propertyId) return;

initBooking(propertyId);

}

/* =============================
BOOK PROPERTY
============================= */

function initBooking(propertyId){

const btn = document.getElementById("bookVisitBtn");

if(!btn) return;

btn.addEventListener("click", async ()=>{

const user = Storage.getUser();

if(!user){

notify("Please login to book a visit","error");

setTimeout(()=>{
window.location.href="login.html";
},1500);

return;

}

btn.disabled = true;

try{

showLoader();

await apiRequest("/bookings","POST",{
property_id:propertyId
});

notify("Booking created successfully","success");

/* 🔹 REDIRECT AFTER SUCCESS */

setTimeout(()=>{
window.location.href="bookings.html";
},1200);

}
catch(err){

console.error(err);
notify(err.message || "Booking failed","error");

}
finally{

hideLoader();
btn.disabled = false;

}

});

}

/* =============================
LOAD BOOKINGS PAGE
============================= */

async function loadBookings(){

const container = document.getElementById("bookingList");

if(!container) return;

try{

showLoader();

const bookings = await apiRequest("/bookings");

if(!bookings || bookings.length === 0){

container.innerHTML = `
<div class="empty-state">
No bookings yet.
</div>
`;

return;

}

container.innerHTML = bookings.map(b => {

const statusClass = getStatusClass(b.status);

return `

<div class="booking-card card">

<h3>${escapeHTML(b.title || "Property")}</h3>

<p><strong>Booking Date:</strong> ${formatDate(b.booking_date)}</p>

<p>
<strong>Status:</strong>
<span class="badge ${statusClass}">
${b.status}
</span>
</p>

<a href="listing-details.html?id=${b.property_id}"
class="btn btn--outline btn--small">
View Property
</a>

</div>

`;

}).join("");

}
catch(err){

console.error(err);
notify("Failed to load bookings","error");

}
finally{

hideLoader();

}

}

/* =============================
STATUS BADGE
============================= */

function getStatusClass(status){

if(!status) return "";

status = status.toLowerCase();

if(status === "approved") return "badge--sale";

if(status === "pending") return "badge--rent";

if(status === "rejected") return "badge--featured";

return "";

}

/* =============================
FORMAT DATE
============================= */

function formatDate(date){

if(!date) return "-";

return new Date(date).toLocaleDateString();

}

/* =============================
XSS PROTECTION
============================= */

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