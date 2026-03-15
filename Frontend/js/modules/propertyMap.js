// =============================
// PROPERTY MAP
// =============================

document.addEventListener("DOMContentLoaded", loadPropertyMap);

async function loadPropertyMap(){

const mapContainer = document.getElementById("propertyMap");

if(!mapContainer) return;

const params = new URLSearchParams(window.location.search);

const id = params.get("id");

if(!id) return;

try{

const property = await apiRequest(`/properties/${id}`);

if(!property.latitude || !property.longitude) return;

const map = new google.maps.Map(mapContainer,{

center:{
lat:parseFloat(property.latitude),
lng:parseFloat(property.longitude)
},

zoom:14

});

new google.maps.Marker({

position:{
lat:parseFloat(property.latitude),
lng:parseFloat(property.longitude)
},

map,
title:property.title

});

}
catch(err){

console.error(err);

}

}