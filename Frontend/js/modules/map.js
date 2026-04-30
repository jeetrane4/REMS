// =============================
// MAP SEARCH MODULE
// =============================

document.addEventListener("DOMContentLoaded", initMapSearch);

let propertyMap = null;
let mapMarkers = [];

/* =============================
   INIT MAP SEARCH
============================= */

function initMapSearch() {
  const mapContainer = document.getElementById("propertyMap");
  if (!mapContainer) return;

  if (!window.google || !google.maps) {
    mapContainer.innerHTML = `
      <div class="empty-state">
        Google Maps is not loaded.
      </div>
    `;
    return;
  }

  const defaultLat = 21.1702;
  const defaultLng = 72.8311;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        loadMap(position.coords.latitude, position.coords.longitude);
      },
      () => {
        loadMap(defaultLat, defaultLng);
      }
    );
  } else {
    loadMap(defaultLat, defaultLng);
  }
}

/* =============================
   RESPONSE HELPER
============================= */

function getResponseData(response, fallback = []) {
  if (!response) return fallback;
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  return fallback;
}

/* =============================
   LOAD MAP
============================= */

function loadMap(lat, lng) {
  propertyMap = new google.maps.Map(document.getElementById("propertyMap"), {
    center: {
      lat: Number(lat),
      lng: Number(lng)
    },
    zoom: 12
  });

  loadNearbyProperties(propertyMap, lat, lng);
}

/* =============================
   FETCH NEARBY PROPERTIES
============================= */

async function loadNearbyProperties(map, lat, lng, radius = 5) {
  try {
    clearMarkers();

    const res = await window.API.get(
      `/map?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&radius=${encodeURIComponent(radius)}`
    );

    const properties = getResponseData(res, []);

    if (!properties.length) {
      window.notify?.("No nearby properties found", "info");
      return;
    }

    properties.forEach((property) => {
      const propLat = Number(property.latitude);
      const propLng = Number(property.longitude);

      if (isNaN(propLat) || isNaN(propLng)) return;

      const marker = new google.maps.Marker({
        position: {
          lat: propLat,
          lng: propLng
        },
        map,
        title: property.title || "Property"
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="map-popup">
            <h3>${escapeHTML(property.title || "Property")}</h3>
            <p>${escapeHTML(property.city || "")}</p>
            <p><strong>${window.Utils?.formatCurrency?.(property.price) || `₹${Number(property.price || 0).toLocaleString("en-IN")}`}</strong></p>
            <a href="listing-details.html?id=${escapeHTML(property.property_id)}">
              View Property
            </a>
          </div>
        `
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

      mapMarkers.push(marker);
    });
  } catch (err) {
    console.error("Map load error:", err);
    window.notify?.("Failed to load map properties", "error");
  }
}

/* =============================
   CLEAR MARKERS
============================= */

function clearMarkers() {
  mapMarkers.forEach((marker) => marker.setMap(null));
  mapMarkers = [];
}

/* =============================
   XSS PROTECTION
============================= */

function escapeHTML(value) {
  const str = String(value ?? "");

  return str.replace(/[&<>"']/g, (m) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[m];
  });
}

/* expose globally */

window.initMapSearch = initMapSearch;
window.loadNearbyProperties = loadNearbyProperties;