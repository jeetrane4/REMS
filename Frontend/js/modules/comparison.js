// =============================
// PROPERTY COMPARISON MODULE
// =============================

let selectedProperties = [];

document.addEventListener("DOMContentLoaded", initComparison);

function initComparison(){

const btn = document.getElementById("compareBtn");

if(btn){

btn.addEventListener("click", compareSelected);

}

}

/* =============================
ADD PROPERTY TO COMPARE
============================= */

function toggleCompare(propertyId){

if(selectedProperties.includes(propertyId)){

selectedProperties =
selectedProperties.filter(id=>id!==propertyId);

}
else{

if(selectedProperties.length >= 3){

notify("You can compare max 3 properties","info");
return;

}

selectedProperties.push(propertyId);

}

updateCompareUI();

}

/* =============================
UPDATE COMPARE UI
============================= */

function updateCompareUI(){

const counter = document.getElementById("compareCount");

if(counter){

counter.textContent = selectedProperties.length;

}

}

/* =============================
COMPARE SELECTED
============================= */

async function compareSelected(){

if(selectedProperties.length < 2){

notify("Select at least 2 properties","error");
return;

}

try{

showLoader();

const res = await apiRequest(
"/properties/compare",
"POST",
{ property_ids:selectedProperties }
);

renderComparison(res.properties);

}
catch(err){

console.error(err);
notify("Comparison failed","error");

}
finally{

hideLoader();

}

}

/* =============================
RENDER COMPARISON TABLE
============================= */

function renderComparison(properties){

const table = document.getElementById("comparisonTable");

if(!table) return;

table.innerHTML = `

<tr>
<th>Title</th>
${properties.map(p=>`<td>${p.title}</td>`).join("")}
</tr>

<tr>
<th>Price</th>
${properties.map(p=>`<td>₹${p.price}</td>`).join("")}
</tr>

<tr>
<th>Bedrooms</th>
${properties.map(p=>`<td>${p.bedrooms||"-"}</td>`).join("")}
</tr>

<tr>
<th>Area</th>
${properties.map(p=>`<td>${p.area||"-"} sqft</td>`).join("")}
</tr>

<tr>
<th>City</th>
${properties.map(p=>`<td>${p.city}</td>`).join("")}
</tr>

`;

}

/* expose globally */

window.toggleCompare = toggleCompare;