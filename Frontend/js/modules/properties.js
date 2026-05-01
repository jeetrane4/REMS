// =============================
// PROPERTY MODULE – REMS
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
   HELPERS
================================================= */

function getResponseData(response, fallback = []) {
  if (!response) return fallback;
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (response.data && typeof response.data === "object") return response.data;
  return fallback;
}

function resolveImagePath(image) {
  if (!image) return "images/img1.webp";

  if (image.startsWith("http")) return image;

  if (image.startsWith("/uploads")) {
    const base = (window.API_BASE || "http://localhost:5000/api").replace("/api", "");
    return `${base}${image}`;
  }

  return image;
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

/* =================================================
   SEARCH
================================================= */

function initSearch() {
  const form = document.getElementById("searchForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const city = document.getElementById("city")?.value?.trim() || "";
    const type = document.getElementById("type")?.value || "";
    const budget = document.getElementById("budget")?.value || "";

    const params = new URLSearchParams();

    if (city) params.append("city", city);
    if (type) params.append("type", type);

    if (budget) {
      if (budget.includes("-")) {
        const [min, max] = budget.split("-");
        if (min) params.append("minPrice", min);
        if (max) params.append("maxPrice", max);
      } else if (budget.includes("+")) {
        params.append("minPrice", budget.replace("+", ""));
      }
    }

    window.location.href = `listings.html?${params.toString()}`;
  });
}

/* =================================================
   FEATURED PROPERTIES
================================================= */

async function loadFeaturedProperties() {
  const container = document.getElementById("featuredProperties");
  if (!container) return;

  try {
    window.showLoader?.();

    const res = await window.API.get("/properties?limit=6");
    const list = getResponseData(res, []).slice(0, 6);

    container.innerHTML = list.length
      ? list.map(renderPropertyCard).join("")
      : `<p class="muted-text">No featured properties available.</p>`;
  } catch (err) {
    console.error(err);
    window.notify?.("Failed to load featured properties", "error");
  } finally {
    window.hideLoader?.();
  }
}

/* =================================================
   PROPERTY LIST
================================================= */

async function initPropertyList() {
  const container = document.getElementById("propertyList");
  if (!container) return;

  try {
    window.showLoader?.();

    container.innerHTML = `<div class="loading-state">Loading properties...</div>`;

    const params = new URLSearchParams(window.location.search);
    const query = params.toString();

    const res = await window.API.get(`/properties${query ? `?${query}` : ""}`);
    const properties = getResponseData(res, []);

    if (!properties.length) {
      container.innerHTML = "";
      document.getElementById("emptyState")?.classList.remove("hidden");
      updateResults(0);
      return;
    }

    document.getElementById("emptyState")?.classList.add("hidden");
    container.innerHTML = properties.map(renderPropertyCard).join("");

    updateResults(res.total || properties.length);
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="error-text">Failed to load properties.</p>`;
    window.notify?.("Failed to load properties", "error");
  } finally {
    window.hideLoader?.();
  }
}

/* =================================================
   ADD PROPERTY
================================================= */
function initAddProperty() {
  const form = document.getElementById("addPropertyForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = window.Storage?.getUser?.();

    if (!user || !window.Storage?.getToken?.()) {
      window.notify?.("Please login before adding property", "error");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 800);
      return;
    }

    if (!["seller", "agent", "admin"].includes(user.role)) {
      window.notify?.("Only seller, agent, or admin can add property", "error");
      return;
    }

    const submitBtn = document.getElementById("submitPropertyBtn");

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
    }

    const formData = new FormData(form);

    const amenities = Array.from(
      document.querySelectorAll('input[name="amenities"]:checked')
    ).map((a) => a.value);

    const documentFields = [
      "ownership_proof",
      "title_deed",
      "tax_receipt",
      "building_approval",
      "floor_plan"
    ];

    const propertyPayload = {};

    formData.forEach((value, key) => {
      if (
        key !== "images" &&
        key !== "amenities" &&
        !documentFields.includes(key)
      ) {
        propertyPayload[key] = typeof value === "string" ? value.trim() : value;
      }
    });

    propertyPayload.amenities = amenities;
    propertyPayload.price = Number(propertyPayload.price || 0);
    propertyPayload.bedrooms = Number(propertyPayload.bedrooms || 0);
    propertyPayload.bathrooms = Number(propertyPayload.bathrooms || 0);
    propertyPayload.area = propertyPayload.area ? Number(propertyPayload.area) : null;
    propertyPayload.latitude = propertyPayload.latitude ? Number(propertyPayload.latitude) : null;
    propertyPayload.longitude = propertyPayload.longitude ? Number(propertyPayload.longitude) : null;

    try {
      window.showLoader?.();

      const res = await window.API.post("/properties", propertyPayload);
      const property = res?.data || res;
      const propertyId = property?.property_id || property?.id;

      if (!propertyId) {
        throw new Error("Property created but property ID was not returned");
      }

      let imageUploadOk = true;
      let documentUploadOk = true;

      try {
        await uploadPropertyImagesFromAddForm(propertyId);
      } catch (imageErr) {
        imageUploadOk = false;
        console.error("Image upload failed:", imageErr);
      }

      try {
        await uploadPropertyDocumentsFromAddForm(propertyId, documentFields);
      } catch (docErr) {
        documentUploadOk = false;
        console.error("Document upload failed:", docErr);
      }

      if (imageUploadOk && documentUploadOk) {
        window.notify?.("Property, images, and documents submitted successfully", "success");
      } else if (!imageUploadOk && documentUploadOk) {
        window.notify?.("Property created, but image upload failed. You can upload images later.", "warning");
      } else if (imageUploadOk && !documentUploadOk) {
        window.notify?.("Property created, but document upload failed. You can upload documents later.", "warning");
      } else {
        window.notify?.("Property created, but images/documents failed. You can upload them later.", "warning");
      }

      setTimeout(() => {
        window.location.href = `listing-details.html?id=${propertyId}`;
      }, 1000);
    } catch (err) {
      console.error(err);
      window.notify?.(err.message || "Failed to add property", "error");
    } finally {
      window.hideLoader?.();

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Property";
      }
    }
  });
}

async function uploadPropertyImagesFromAddForm(propertyId) {
  const imageInput = document.getElementById("images");

  if (!imageInput || !imageInput.files || imageInput.files.length === 0) {
    return;
  }

  const uploadData = new FormData();

  Array.from(imageInput.files).forEach((file) => {
    uploadData.append("images", file);
  });

  const res = await window.API.upload(`/property-images/${propertyId}`, uploadData);

  if (!res?.success) {
    throw new Error(res?.message || "Image upload failed");
  }

  return res;
}

async function uploadPropertyDocumentsFromAddForm(propertyId, documentFields) {
  for (const field of documentFields) {
    const input = document.getElementById(field);

    if (!input || !input.files || input.files.length === 0) {
      continue;
    }

    const uploadData = new FormData();

    uploadData.append("document_type", field);
    uploadData.append("document", input.files[0]);

    const res = await window.API.upload(`/property-documents/${propertyId}`, uploadData);

    if (!res?.success) {
      throw new Error(res?.message || `Document upload failed: ${field}`);
    }
  }
}

/* =================================================
   PROPERTY CARD TEMPLATE
================================================= */

function renderPropertyCard(p) {
  const id = p.property_id || p.id;
  const image = resolveImagePath(
  p.image ||
  p.image_url ||
  p.images?.[0]?.image_url ||
  p.images?.[0] ||
  "images/img1.webp"
);

  return `
    <div class="property-card">
      <div class="property-card__image">
        <img
          src="${escapeHTML(image)}"
          alt="${escapeHTML(p.title || "Property")}"
          loading="lazy"
          onerror="this.src='images/img1.webp'"
        >

        <span class="property-badge">
          ${escapeHTML(p.type || "Property")}
        </span>
      </div>

      <div class="property-card__content">
        <h3>${escapeHTML(p.title || "Untitled Property")}</h3>

        <p class="property-card__location">
          ${escapeHTML(p.city || "Location not available")}
        </p>

        <p class="property-card__price">
          ${window.Utils?.formatCurrency?.(p.price) || `₹${Number(p.price || 0).toLocaleString("en-IN")}`}
        </p>

        <div class="property-card__actions">
          <a href="listing-details.html?id=${id}" class="btn btn--primary btn--small">
            View Details
          </a>

          <button type="button" onclick="toggleCompare(${id})" class="btn btn--outline btn--small">
            Compare
          </button>
        </div>
      </div>
    </div>
  `;
}

/* =================================================
   RESULT COUNT
================================================= */

function updateResults(count) {
  const el = document.getElementById("resultsCount");

  if (el) {
    el.textContent = `${count} Properties Found`;
  }
}

/* =================================================
   PROPERTY DETAILS PAGE
================================================= */

async function initPropertyDetails() {
  const container = document.getElementById("propertyDetails");
  if (!container) return;

  const propertyId = new URLSearchParams(window.location.search).get("id");

  if (!propertyId) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Property ID missing</h3>
        <p>Please open this page from the listings page.</p>
        <a href="listings.html" class="btn btn--primary">Back to Listings</a>
      </div>
    `;
    return;
  }

  try {
    window.showLoader?.();

    console.log("DETAIL PAGE PROPERTY ID:", propertyId);

    const res = await window.API.get(`/properties/${propertyId}`);

    console.log("DETAIL PAGE API RESPONSE:", res);

    let property = null;

    if (res?.success === true && res?.data) {
      property = res.data;
    } else if (res?.data?.property_id) {
      property = res.data;
    } else if (res?.property_id) {
      property = res;
    }

    console.log("DETAIL PAGE FINAL PROPERTY:", property);

    if (!property || !property.property_id) {
      throw new Error("Property not found");
    }

    renderPropertyDetails(property);
  } catch (err) {
    console.error("Property details load error:", err);

    container.innerHTML = `
      <div class="empty-state">
        <h3>Property not found</h3>
        <p>This property may not exist, or the wrong property ID is being used.</p>
        <p class="muted-text">Current property ID: ${escapeHTML(propertyId)}</p>
        <a href="listings.html" class="btn btn--primary">Back to Listings</a>
      </div>
    `;

    window.notify?.("Failed to load property", "error");
  } finally {
    window.hideLoader?.();
  }
}

/* =================================================
   RENDER PROPERTY DETAILS
================================================= */

function renderPropertyDetails(property) {
  const container = document.getElementById("propertyDetails");
  if (!container) return;

  const id = property.property_id || property.id;
  const images = Array.isArray(property.images) && property.images.length
    ? property.images
    : [{ image_url: property.image || "images/img1.jpg" }];

  const gallery = document.getElementById("propertyGallery");

  if (gallery) {
    gallery.innerHTML = images
      .map((img) => {
        const src = resolveImagePath(img.image_url || img);
        return `
          <div class="swiper-slide">
            <img
              src="${escapeHTML(src)}"
              alt="${escapeHTML(property.title || "Property")}"
              onerror="this.src='images/img1.jpg'"
            >
          </div>
        `;
      })
      .join("");
  }

  container.innerHTML = `
    <h1>${escapeHTML(property.title || "Untitled Property")}</h1>

    <p class="muted-text">
      ${escapeHTML([property.address, property.city, property.state].filter(Boolean).join(", "))}
    </p>

    <h2>${window.Utils?.formatCurrency?.(property.price) || `₹${Number(property.price || 0).toLocaleString("en-IN")}`}</h2>

    <p>${escapeHTML(property.description || "No description available.")}</p>

    <ul class="property-meta">
      <li>Type: ${escapeHTML(property.type || "-")}</li>
      <li>Listing: ${escapeHTML(property.listing_type || "-")}</li>
      <li>Status: ${escapeHTML(property.status || "-")}</li>
      <li>Bedrooms: ${escapeHTML(property.bedrooms ?? "-")}</li>
      <li>Bathrooms: ${escapeHTML(property.bathrooms ?? "-")}</li>
      <li>Area: ${escapeHTML(property.area ?? "-")} sq.ft</li>
      <li>Views: ${escapeHTML(property.views ?? 0)}</li>
    </ul>
  `;

  const price = document.getElementById("sidebarPrice");
  const location = document.getElementById("sidebarLocation");

  if (price) {
    price.textContent =
      window.Utils?.formatCurrency?.(property.price) ||
      `₹${Number(property.price || 0).toLocaleString("en-IN")}`;
  }

  if (location) {
    location.textContent = property.city || "-";
  }

  const saveBtn = document.getElementById("savePropertyBtn");

  if (saveBtn) {
    saveBtn.onclick = () => saveProperty(id);
  }

  if (typeof window.initBooking === "function") {
    window.initBooking(id);
  }

  initSlider();
}

/* =================================================
   SAVE PROPERTY
================================================= */

async function saveProperty(propertyId) {
  const user = window.Storage?.getUser?.();

  if (!user) {
    window.notify?.("Login to save properties", "error");
    return;
  }

  if (user.role !== "buyer") {
    window.notify?.("Only buyers can save properties", "warning");
    return;
  }

  try {
    await window.API.post("/saved-properties", {
      property_id: propertyId
    });

    window.notify?.("Property saved", "success");

    const btn = document.getElementById("savePropertyBtn");

    if (btn) {
      btn.textContent = "Saved ✓";
      btn.disabled = true;
    }
  } catch (err) {
    if (err.message === "Property already saved") {
      window.notify?.("Already saved", "info");
    } else {
      window.notify?.(err.message || "Failed to save property", "error");
    }
  }
}

/* =================================================
   SAVED PROPERTIES PAGE
================================================= */

async function loadSavedProperties() {
  const container = document.getElementById("savedProperties");
  if (!container) return;

  try {
    const res = await window.API.get("/saved-properties");
    const properties = getResponseData(res, []);

    container.innerHTML = properties.length
      ? properties.map(renderPropertyCard).join("")
      : `<p class="muted-text">No saved properties yet.</p>`;
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="error-text">Failed to load saved properties.</p>`;
  }
}

/* =================================================
   RECOMMENDED PROPERTIES
================================================= */

async function loadRecommended() {
  const container = document.getElementById("recommendedProperties");
  if (!container) return;

  try {
    let properties = [];

    if (window.Storage?.isLoggedIn?.()) {
      const res = await window.API.get("/recommendations");
      properties = getResponseData(res, []);
    } else {
      const res = await window.API.get("/properties?limit=6");
      properties = getResponseData(res, []);
    }

    container.innerHTML = properties.length
      ? properties.slice(0, 6).map(renderPropertyCard).join("")
      : `<p class="muted-text">No recommendations available.</p>`;
  } catch (err) {
    console.error(err);
  }
}

/* =================================================
   RECENT PROPERTIES
================================================= */

async function loadRecentProperties() {
  const container = document.getElementById("recentProperties");
  if (!container) return;

  try {
    const res = await window.API.get("/properties?limit=6");
    const properties = getResponseData(res, []);

    container.innerHTML = properties.length
      ? properties.slice(0, 6).map(renderPropertyCard).join("")
      : `<p class="muted-text">No recent properties available.</p>`;
  } catch (err) {
    console.error(err);
  }
}

/* =================================================
   SIMILAR PROPERTIES
================================================= */

async function loadSimilarProperties() {
  const container = document.getElementById("similarProperties");
  if (!container) return;

  try {
    const currentId = new URLSearchParams(window.location.search).get("id");
    const res = await window.API.get("/properties?limit=4");
    const properties = getResponseData(res, []).filter(
      (p) => String(p.property_id) !== String(currentId)
    );

    container.innerHTML = properties.length
      ? properties.slice(0, 4).map(renderPropertyCard).join("")
      : `<p class="muted-text">No similar properties available.</p>`;
  } catch (err) {
    console.error(err);
  }
}

/* =================================================
   HOMEPAGE STATS
================================================= */

async function loadHomepageStats() {
  const prop = document.getElementById("statProperties");
  const users = document.getElementById("statUsers");
  const cities = document.getElementById("statCities");

  if (!prop && !users && !cities) return;

  try {
    const res = await window.API.get("/dashboard/stats");
    const stats = getResponseData(res, {});

    if (prop) prop.textContent = stats.totalProperties || 0;
    if (users) users.textContent = stats.totalUsers || 0;
    if (cities) cities.textContent = stats.totalCities || 0;
  } catch (err) {
    console.error(err);
  }
}

/* =================================================
   SWIPER
================================================= */

function initSlider() {
  if (!document.querySelector(".property-slider")) return;
  if (typeof Swiper === "undefined") return;

  new Swiper(".property-slider", {
    loop: true,
    pagination: {
      el: ".swiper-pagination"
    }
  });
}

/* =================================================
   COMPARE FALLBACK
================================================= */

function toggleCompare(propertyId) {
  let compareList = JSON.parse(localStorage.getItem("rems_compare") || "[]");

  if (compareList.includes(propertyId)) {
    compareList = compareList.filter((id) => id !== propertyId);
    window.notify?.("Removed from comparison", "info");
  } else {
    if (compareList.length >= 5) {
      window.notify?.("You can compare maximum 5 properties", "warning");
      return;
    }

    compareList.push(propertyId);
    window.notify?.("Added to comparison", "success");
  }

  localStorage.setItem("rems_compare", JSON.stringify(compareList));
}

/* expose globally */

window.renderPropertyCard = renderPropertyCard;
window.renderPropertyDetails = renderPropertyDetails;
window.saveProperty = saveProperty;
window.toggleCompare = window.toggleCompare || toggleCompare;
window.loadFeaturedProperties = loadFeaturedProperties;
window.loadSavedProperties = loadSavedProperties;
window.loadRecommended = loadRecommended;