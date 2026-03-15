// =============================
// MAP SEARCH MODULE
// =============================

document.addEventListener("DOMContentLoaded", initMapSearch);

function initMapSearch(){

const mapContainer = document.getElementById("propertyMap");

if(!mapContainer) return;

/* default location (Surat) */

const defaultLat = 21.1702;
const defaultLng = 72.8311;

loadMap(defaultLat, defaultLng);

}

/* =============================
LOAD MAP
============================= */

function loadMap(lat,lng){

const map = new google.maps.Map(
document.getElementById("propertyMap"),
{
center:{ lat,lng },
zoom:12
}
);

loadNearbyProperties(map,lat,lng);

}

/* =============================
FETCH NEARBY PROPERTIES
============================= */

async function loadNearbyProperties(map,lat,lng){

try{

const properties = await apiRequest(
`/map?lat=${lat}&lng=${lng}&radius=5`
);

if(!properties) return;

properties.forEach(property=>{

const marker = new google.maps.Marker({
position:{
lat:parseFloat(property.latitude),
lng:parseFloat(property.longitude)
},
map,
title:property.title
});

const infoWindow = new google.maps.InfoWindow({

content:`

<div class="map-popup">

<h3>${property.title}</h3>

<p>${property.city}</p>

<p><strong>₹${property.price}</strong></p>

<a href="listing-details.html?id=${property.property_id}">
View Property
</a>

</div>

`

});

marker.addListener("click",()=>{
infoWindow.open(map,marker);
});

});

}
catch(err){

console.error("Map load error:",err);

}

}