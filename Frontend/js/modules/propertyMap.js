// =============================
// PROPERTY DETAIL MAP
// =============================

document.addEventListener("DOMContentLoaded", loadPropertyMap);

async function loadPropertyMap() {
  const mapContainer = document.getElementById("propertyMap");
  if (!mapContainer) return;

  if (!window.google || !google.maps) {
    mapContainer.innerHTML = `<div class="empty-state">Google Maps is not loaded.</div>`;
    return;
  }

  const id = new URLSearchParams(window.location.search).get("id");

  if (!id) return;

  try {
    const res = await window.API.get(`/properties/${id}`);
    const property = res?.data;

    if (!property?.latitude || !property?.longitude) {
      mapContainer.innerHTML = `<div class="empty-state">Map location not available.</div>`;
      return;
    }

    const lat = Number(property.latitude);
    const lng = Number(property.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      mapContainer.innerHTML = `<div class="empty-state">Invalid property location.</div>`;
      return;
    }

    const map = new google.maps.Map(mapContainer, {
      center: { lat, lng },
      zoom: 14
    });

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      title: property.title || "Property"
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="map-popup">
          <h3>${escapeHTML(property.title || "Property")}</h3>
          <p>${escapeHTML(property.city || "")}</p>
          <p><strong>${
            window.Utils?.formatCurrency?.(property.price) ||
            `₹${Number(property.price || 0).toLocaleString("en-IN")}`
          }</strong></p>
        </div>
      `
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });
  } catch (err) {
    console.error(err);
    mapContainer.innerHTML = `<div class="empty-state">Failed to load property map.</div>`;
  }
}

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

window.loadPropertyMap = loadPropertyMap;