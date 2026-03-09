// =============================
// PROPERTY MODULE – REMS (FULL VERSION)
// =============================

document.addEventListener("DOMContentLoaded", initPropertyModule);

function initPropertyModule() {

  initSearch();
  loadFeaturedProperties();
  initPropertyList();
  initPropertyDetails();
  initAddProperty();

  loadSavedProperties();
  loadRecommended();
  loadRecentProperties();
  loadSimilarProperties();
  loadHomepageStats();

  initSlider();
}

/* =================================================
SEARCH (INDEX PAGE)
================================================= */

function initSearch(){

  const form = document.getElementById("searchForm");
  if(!form) return;

  form.addEventListener("submit",(e)=>{

    e.preventDefault();

    const city = document.getElementById("city")?.value || "";
    const type = document.getElementById("type")?.value || "";
    const budget = document.getElementById("budget")?.value || "";

    const params = new URLSearchParams();

    if(city) params.append("city",city);
    if(type) params.append("type",type);

    if(budget){

      if(budget.includes("-")){
        const [min,max] = budget.split("-");
        params.append("minPrice",min);
        params.append("maxPrice",max);
      }

      if(budget.includes("+")){
        params.append("minPrice",budget.replace("+",""));
      }

    }

    window.location.href = `listings.html?${params.toString()}`;

  });

}

/* =================================================
FEATURED PROPERTIES (HOME)
================================================= */

async function loadFeaturedProperties(){

  const container = document.getElementById("featuredProperties");
  if(!container) return;

  try{

    showLoader?.();

    const properties = await apiRequest("/properties");

    const list = properties?.slice(0,6) || [];

    container.innerHTML = list.map(renderPropertyCard).join("");

  }catch(err){

    console.error(err);
    notify?.("Failed to load featured properties","error");

  }finally{
    hideLoader?.();
  }

}

/* =================================================
PROPERTY LIST (LISTINGS PAGE)
================================================= */

async function initPropertyList(){

  const container = document.getElementById("propertyList");
  if(!container) return;

  try{

    showLoader?.();
    container.innerHTML = `
      <div class="loading-state">
      Loading properties...
      </div>
    `;

    const params = new URLSearchParams(window.location.search);
    const query = params.toString();

    const properties = await apiRequest(`/properties?${query}`);

    if(!properties || properties.length === 0){

      const empty = document.getElementById("emptyState");
      if(empty) empty.classList.remove("hidden");
      return;

    }

    container.innerHTML = properties.map(renderPropertyCard).join("");

    updateResults(properties.length);

  }catch(err){

    console.error(err);
    notify?.("Failed to load properties","error");

  }finally{
    hideLoader?.();
  }

}

/* =============================
ADD PROPERTY
============================= */

function initAddProperty(){

const form = document.getElementById("addPropertyForm");

if(!form) return;

form.addEventListener("submit", async (e)=>{

e.preventDefault();

const data = new FormData(form);

const amenities = Array.from(
document.querySelectorAll('input[name="amenities"]:checked')
).map(a => a.value);

data.set("amenities", JSON.stringify(amenities));

const payload = Object.fromEntries(data.entries());

try{

showLoader?.();

await apiRequest("/properties","POST",payload);

notify?.("Property added successfully","success");

setTimeout(()=>{
window.location.href = "listings.html";
},1200);

}
catch(err){

console.error(err);
notify?.("Failed to add property","error");

}
finally{
hideLoader?.();
}

});

}

/* =================================================
PROPERTY CARD TEMPLATE
================================================= */

function renderPropertyCard(p){

const id = p.property_id || p.id;

return `

<div class="property-card">

<div class="property-card__image">

<img
src="${p.image || 'images/img1.webp'}"
alt="${escapeHTML(p.title)}"
loading="lazy"
onerror="this.src='images/img1.webp'"
>

<span class="property-badge">
${escapeHTML(p.type || "Property")}
</span>

</div>

<div class="property-card__content">

<h3>${escapeHTML(p.title)}</h3>

<p class="property-card__location">
${escapeHTML(p.city)}
</p>

<p class="property-card__price">
₹${Number(p.price).toLocaleString()}
</p>

<a href="listing-details.html?id=${id}"
class="btn btn--primary btn--small">
View Details
</a>

</div>

</div>

`;

}

/* =================================================
RESULT COUNT
================================================= */

function updateResults(count){

  const el = document.getElementById("resultsCount");

  if(el){
    el.textContent = `${count} Properties Found`;
  }

}

/* =================================================
PROPERTY DETAILS PAGE
================================================= */

async function initPropertyDetails(){

  const container = document.getElementById("propertyDetails");
  if(!container) return;

  const params = new URLSearchParams(window.location.search);
  const propertyId = params.get("id");

  if(!propertyId) return;

  try{

    showLoader?.();

    const property = await apiRequest(`/properties/${propertyId}`);

    renderPropertyDetails(property);

  }catch(err){

    console.error(err);
    notify?.("Failed to load property","error");

  }finally{
    hideLoader?.();
  }

}

/* =================================================
RENDER PROPERTY DETAILS
================================================= */

function renderPropertyDetails(property){

  const container = document.getElementById("propertyDetails");
  if(!container) return;

  const id = property.property_id || property.id;

  container.innerHTML = `

<h1>${escapeHTML(property.title)}</h1>

<p class="muted-text">${escapeHTML(property.city)}</p>

<h2>₹${Number(property.price).toLocaleString()}</h2>

<p>${escapeHTML(property.description)}</p>

<ul class="property-meta">
<li>Type: ${escapeHTML(property.type)}</li>
<li>Status: ${escapeHTML(property.status)}</li>
</ul>

`;

  const price = document.getElementById("sidebarPrice");
  const location = document.getElementById("sidebarLocation");

  if(price) price.textContent = `₹${Number(property.price).toLocaleString()}`;
  if(location) location.textContent = property.city;

  const saveBtn = document.getElementById("savePropertyBtn");

  if(saveBtn){
    saveBtn.onclick = () => saveProperty(id);
  }

  /* 🔴 IMPORTANT FIX — initialize booking AFTER property loads */

  if(typeof initBooking === "function"){
    initBooking(id);
  }

}

/* =================================================
SAVE PROPERTY
================================================= */

async function saveProperty(propertyId){

const user = Storage?.getUser?.();

if(!user){

notify?.("Login to save properties","error");
return;

}

try{

await apiRequest("/saved-properties","POST",{
property_id:propertyId
});

notify?.("Property saved","success");

const btn = document.getElementById("savePropertyBtn");

if(btn){
btn.textContent = "Saved ✓";
btn.disabled = true;
}

}catch(err){

if(err.message === "Property already saved"){

notify?.("Already saved","info");

}else{

notify?.("Failed to save property","error");

}

}

}

/* =================================================
SAVED PROPERTIES PAGE
================================================= */

async function loadSavedProperties(){

  const container = document.getElementById("savedProperties");
  if(!container) return;

  try{

    const properties = await apiRequest("/saved-properties");

    if(!properties) return;

    container.innerHTML = properties.map(renderPropertyCard).join("");

  }catch(err){
    console.error(err);
  }

}

/* =================================================
RECOMMENDED PROPERTIES
================================================= */

async function loadRecommended(){

  const container = document.getElementById("recommendedProperties");
  if(!container) return;

  try{

    const properties = await apiRequest("/properties");

    const list = properties?.slice(0,6) || [];

    container.innerHTML = list.map(renderPropertyCard).join("");

  }catch(err){
    console.error(err);
  }

}

/* =================================================
RECENT PROPERTIES
================================================= */

async function loadRecentProperties(){

  const container = document.getElementById("recentProperties");
  if(!container) return;

  try{

    const properties = await apiRequest("/properties");

    const list = properties?.slice(-6).reverse() || [];

    container.innerHTML = list.map(renderPropertyCard).join("");

  }catch(err){
    console.error(err);
  }

}

async function loadSimilarProperties(){

const container = document.getElementById("similarProperties");

if(!container) return;

try{

const properties = await apiRequest("/properties");

const list = properties?.slice(0,4) || [];

container.innerHTML = list.map(renderPropertyCard).join("");

}catch(err){

console.error(err);

}

}

/* =================================================
HOMEPAGE STATS
================================================= */

async function loadHomepageStats(){

  try{

    const stats = await apiRequest("/dashboard/stats");

    const prop = document.getElementById("statProperties");
    const users = document.getElementById("statUsers");
    const cities = document.getElementById("statCities");

    if(prop) prop.textContent = stats.totalProperties || 0;
    if(users) users.textContent = stats.totalUsers || 0;
    if(cities) cities.textContent = stats.totalCities || 0;

  }catch(err){
    console.error(err);
  }

}

/* =================================================
SWIPER
================================================= */

function initSlider(){

  if(!document.querySelector(".property-slider")) return;

  new Swiper(".property-slider",{
    loop:true,
    pagination:{ el:".swiper-pagination" }
  });

}

/* =================================================
XSS PROTECTION
================================================= */

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