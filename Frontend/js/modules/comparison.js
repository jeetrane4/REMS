// =============================
// PROPERTY COMPARISON MODULE
// =============================

const COMPARE_KEY = "rems_compare";
const MAX_COMPARE = 5;

let selectedProperties = [];

document.addEventListener("DOMContentLoaded", initComparison);

function initComparison() {
  selectedProperties = loadCompareList();

  updateCompareUI();

  const btn = document.getElementById("compareBtn");

  if (btn) {
    btn.addEventListener("click", compareSelected);
  }

  const table = document.getElementById("comparisonTable");

  if (table && selectedProperties.length >= 2) {
    compareSelected();
  }
}

/* =============================
   STORAGE
============================= */

function loadCompareList() {
  try {
    return JSON.parse(localStorage.getItem(COMPARE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCompareList() {
  localStorage.setItem(COMPARE_KEY, JSON.stringify(selectedProperties));
}

/* =============================
   ADD / REMOVE PROPERTY
============================= */

function toggleCompare(propertyId) {
  const id = Number(propertyId);

  if (!id) {
    window.notify?.("Invalid property selected", "error");
    return;
  }

  if (selectedProperties.includes(id)) {
    selectedProperties = selectedProperties.filter((item) => item !== id);
    window.notify?.("Removed from comparison", "info");
  } else {
    if (selectedProperties.length >= MAX_COMPARE) {
      window.notify?.(`You can compare max ${MAX_COMPARE} properties`, "warning");
      return;
    }

    selectedProperties.push(id);
    window.notify?.("Added to comparison", "success");
  }

  saveCompareList();
  updateCompareUI();
}

/* =============================
   UPDATE COMPARE UI
============================= */

function updateCompareUI() {
  const counter = document.getElementById("compareCount");

  if (counter) {
    counter.textContent = selectedProperties.length;
  }

  const btn = document.getElementById("compareBtn");

  if (btn) {
    btn.disabled = selectedProperties.length < 2;
  }
}

/* =============================
   COMPARE SELECTED
============================= */

async function compareSelected() {
  if (selectedProperties.length < 2) {
    window.notify?.("Select at least 2 properties", "error");
    return;
  }

  try {
    window.showLoader?.();

    const res = await window.API.post("/comparisons", {
      property_ids: selectedProperties
    });

    const properties = Array.isArray(res?.data) ? res.data : [];

    if (!properties.length) {
      throw new Error("No comparison data found");
    }

    renderComparison(properties);
  } catch (err) {
    console.error(err);
    window.notify?.(err.message || "Comparison failed", "error");
  } finally {
    window.hideLoader?.();
  }
}

/* =============================
   RENDER COMPARISON TABLE
============================= */

function renderComparison(properties) {
  const table = document.getElementById("comparisonTable");
  if (!table) return;

  table.innerHTML = `
    <tr>
      <th>Title</th>
      ${properties.map((p) => `<td>${escapeHTML(p.title || "-")}</td>`).join("")}
    </tr>

    <tr>
      <th>Price</th>
      ${properties
        .map((p) => `<td>${window.Utils?.formatCurrency?.(p.price) || `₹${Number(p.price || 0).toLocaleString("en-IN")}`}</td>`)
        .join("")}
    </tr>

    <tr>
      <th>Type</th>
      ${properties.map((p) => `<td>${escapeHTML(p.type || "-")}</td>`).join("")}
    </tr>

    <tr>
      <th>Listing Type</th>
      ${properties.map((p) => `<td>${escapeHTML(p.listing_type || "-")}</td>`).join("")}
    </tr>

    <tr>
      <th>Bedrooms</th>
      ${properties.map((p) => `<td>${escapeHTML(p.bedrooms ?? "-")}</td>`).join("")}
    </tr>

    <tr>
      <th>Bathrooms</th>
      ${properties.map((p) => `<td>${escapeHTML(p.bathrooms ?? "-")}</td>`).join("")}
    </tr>

    <tr>
      <th>Area</th>
      ${properties.map((p) => `<td>${escapeHTML(p.area ?? "-")} sqft</td>`).join("")}
    </tr>

    <tr>
      <th>City</th>
      ${properties.map((p) => `<td>${escapeHTML(p.city || "-")}</td>`).join("")}
    </tr>

    <tr>
      <th>Status</th>
      ${properties.map((p) => `<td>${escapeHTML(p.status || "-")}</td>`).join("")}
    </tr>
  `;
}

/* =============================
   CLEAR COMPARISON
============================= */

function clearComparison() {
  selectedProperties = [];
  saveCompareList();
  updateCompareUI();

  const table = document.getElementById("comparisonTable");
  if (table) table.innerHTML = "";

  window.notify?.("Comparison cleared", "info");
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

window.toggleCompare = toggleCompare;
window.compareSelected = compareSelected;
window.clearComparison = clearComparison;