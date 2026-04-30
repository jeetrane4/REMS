// =============================
// REVIEW MODULE
// =============================

document.addEventListener("DOMContentLoaded", initReviews);

let propertyId = null;

/* =============================
   INIT
============================= */

function initReviews() {
  propertyId = new URLSearchParams(window.location.search).get("id");

  if (!propertyId) return;

  loadReviews();
  initReviewForm();
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
   LOAD REVIEWS
============================= */

async function loadReviews() {
  const container = document.getElementById("reviewList");
  if (!container) return;

  try {
    const res = await window.API.get(`/reviews/${propertyId}`);
    const reviews = getResponseData(res, []);

    if (!reviews.length) {
      container.innerHTML = `<p class="muted-text">No reviews yet.</p>`;
      return;
    }

    container.innerHTML = reviews.map(renderReviewCard).join("");
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="muted-text">Failed to load reviews.</p>`;
  }
}

/* =============================
   REVIEW CARD
============================= */

function renderReviewCard(review) {
  const rating = Math.max(1, Math.min(5, Number(review.rating || 1)));

  return `
    <div class="review-card">
      <strong>${escapeHTML(review.user_name || "User")}</strong>

      <div class="review-rating">
        ${"⭐".repeat(rating)}
      </div>

      <p>${escapeHTML(review.comment || "")}</p>

      <span class="review-date">
        ${
          window.Utils?.formatDate?.(review.created_at) ||
          formatDate(review.created_at)
        }
      </span>
    </div>
  `;
}

/* =============================
   SUBMIT REVIEW
============================= */

function initReviewForm() {
  const form = document.getElementById("reviewForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = window.Storage?.getUser?.();

    if (!user) {
      window.notify?.("Please login to submit review", "error");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
      return;
    }

    const submitBtn = form.querySelector("button[type='submit']");
    if (submitBtn) submitBtn.disabled = true;

    const data = Object.fromEntries(new FormData(form));

    data.property_id = Number(propertyId);
    data.rating = Number(data.rating || 5);
    data.comment = data.comment?.trim() || "";

    try {
      window.showLoader?.();

      await window.API.post("/reviews", data);

      window.notify?.("Review submitted successfully", "success");

      form.reset();
      await loadReviews();
    } catch (err) {
      console.error(err);
      window.notify?.(err.message || "Failed to submit review", "error");
    } finally {
      window.hideLoader?.();
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

/* =============================
   UTILS
============================= */

function formatDate(date) {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d)) return "-";
  return d.toLocaleDateString("en-IN");
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

window.loadReviews = loadReviews;
window.initReviews = initReviews;