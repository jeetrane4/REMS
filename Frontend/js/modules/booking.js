// =============================
// BOOKING MODULE
// =============================

document.addEventListener("DOMContentLoaded", () => {
  initBookingFromPage();

  if (document.getElementById("bookingList")) {
    loadBookings();
  }
});

/* =============================
   RESPONSE HELPER
============================= */

function getResponseData(response, fallback = []) {
  if (!response) return fallback;
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (response.data && typeof response.data === "object") return response.data;
  return fallback;
}

/* =============================
   INIT BOOKING FROM PROPERTY PAGE
============================= */

function initBookingFromPage() {
  const btn = document.getElementById("bookVisitBtn");
  if (!btn) return;

  const propertyId = new URLSearchParams(window.location.search).get("id");
  if (!propertyId) return;

  initBooking(propertyId);
}

/* =============================
   BOOK PROPERTY
============================= */

function initBooking(propertyId) {
  const btn = document.getElementById("bookVisitBtn");
  if (!btn || btn.dataset.bookingBound === "true") return;

  btn.dataset.bookingBound = "true";

  btn.addEventListener("click", async () => {
    const user = window.Storage?.getUser?.();

    if (!user) {
      window.notify?.("Please login to book a visit", "error");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);

      return;
    }

    if (user.role !== "buyer") {
      window.notify?.("Only buyers can book properties", "warning");
      return;
    }

    btn.disabled = true;

    try {
      window.showLoader?.();

      await window.API.post("/bookings", {
        property_id: Number(propertyId)
      });

      window.notify?.("Booking created successfully", "success");

      setTimeout(() => {
        window.location.href = "bookings.html";
      }, 1000);
    } catch (err) {
      console.error(err);
      window.notify?.(err.message || "Booking failed", "error");
    } finally {
      window.hideLoader?.();
      btn.disabled = false;
    }
  });
}

/* =============================
   LOAD BOOKINGS PAGE
============================= */

async function loadBookings() {
  const container = document.getElementById("bookingList");
  if (!container) return;

  try {
    window.showLoader?.();

    const res = await window.API.get("/bookings");
    const bookings = getResponseData(res, []);

    if (!bookings.length) {
      container.innerHTML = `
        <div class="empty-state">
          No bookings yet.
        </div>
      `;
      return;
    }

    container.innerHTML = bookings.map(renderBookingCard).join("");
  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div class="empty-state">
        Failed to load bookings.
      </div>
    `;
    window.notify?.("Failed to load bookings", "error");
  } finally {
    window.hideLoader?.();
  }
}

/* =============================
   RENDER BOOKING CARD
============================= */

function renderBookingCard(booking) {
  const statusClass = getStatusClass(booking.status);
  const title = booking.title || booking.property_title || "Property";

  return `
    <div class="booking-card card">
      <h3>${escapeHTML(title)}</h3>

      <p>
        <strong>Booking Date:</strong>
        ${window.Utils?.formatDate?.(booking.booking_date) || formatDate(booking.booking_date)}
      </p>

      <p>
        <strong>Status:</strong>
        <span class="badge ${statusClass}">
          ${escapeHTML(booking.status || "pending")}
        </span>
      </p>

      ${
        booking.property_id
          ? `<a href="listing-details.html?id=${booking.property_id}" class="btn btn--outline btn--small">
              View Property
            </a>`
          : ""
      }
    </div>
  `;
}

/* =============================
   STATUS BADGE
============================= */

function getStatusClass(status) {
  const value = String(status || "").toLowerCase();

  if (value === "confirmed") return "badge--sale";
  if (value === "pending") return "badge--rent";
  if (value === "cancelled") return "badge--featured";

  return "";
}

/* =============================
   FORMAT DATE
============================= */

function formatDate(date) {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d)) return "-";
  return d.toLocaleDateString("en-IN");
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

window.initBooking = initBooking;
window.loadBookings = loadBookings;