// =============================
// DASHBOARD MODULE – REMS
// =============================

document.addEventListener("DOMContentLoaded", initDashboard);

async function initDashboard() {
  const token = window.Storage?.getToken?.();
  const user = window.Storage?.getUser?.();

  if (!token || !user) {
    window.location.href = "login.html";
    return;
  }

  setGreeting(user);
  applyRoleUI(user);

  await loadDashboardSummary(user);
  await loadRecentActivity();
}

/* =============================
   RESPONSE HELPER
============================= */

function getResponseData(response, fallback = null) {
  if (!response) return fallback;
  if (response.data !== undefined) return response.data;
  return response;
}

/* =============================
   USER GREETING
============================= */

function setGreeting(user) {
  const title = document.getElementById("dashboardTitle");
  const subtitle = document.getElementById("dashboardSubtitle");

  if (!user) return;

  if (title) {
    title.textContent = `Welcome back, ${user.name || user.user_name || "User"} 👋`;
  }

  if (subtitle) {
    subtitle.textContent = "Manage your activities and overview";
  }
}

/* =============================
   ROLE BASED UI
============================= */

function applyRoleUI(user) {
  if (!user) return;

  const role = String(user.role || "").toLowerCase();

  document.body.dataset.role = role;

  document.querySelectorAll("[data-role]").forEach((el) => {
    const allowed = el
      .getAttribute("data-role")
      .split(",")
      .map((item) => item.trim().toLowerCase());

    if (!allowed.includes(role)) {
      el.style.display = "none";
    }
  });
}

/* =============================
   LOAD DASHBOARD SUMMARY
============================= */

async function loadDashboardSummary(user) {
  const container = document.getElementById("dashboardSummary");
  if (!container) return;

  try {
    window.showLoader?.();

    const res = await window.API.get("/dashboard");
    const summary = getResponseData(res, {});

    renderStats(container, summary, user.role);
  } catch (err) {
    console.error(err);

    container.innerHTML = `
      <div class="empty-state">
        Failed to load dashboard data
      </div>
    `;

    window.notify?.("Failed to load dashboard summary", "error");
  } finally {
    window.hideLoader?.();
  }
}

/* =============================
   RENDER STATS
============================= */

function renderStats(container, summary, role) {
  let stats = [];

  const userRole = String(role || "").toLowerCase();

  if (userRole === "buyer") {
    stats = [
      { title: "My Bookings", value: summary.totalBookings || 0, icon: "📅" },
      { title: "Saved Properties", value: summary.totalSavedProperties || 0, icon: "❤️" },
      { title: "Transactions", value: summary.totalTransactions || 0, icon: "💳" }
    ];
  } else if (userRole === "seller" || userRole === "agent") {
    stats = [
      { title: "My Properties", value: summary.totalProperties || 0, icon: "🏠" },
      { title: "Total Views", value: summary.totalViews || 0, icon: "👁️" },
      { title: "Bookings Received", value: summary.totalBookings || 0, icon: "📅" },
      { title: "Transactions", value: summary.totalTransactions || 0, icon: "💰" }
    ];
  } else if (userRole === "admin") {
    stats = [
      { title: "Total Users", value: summary.totalUsers || 0, icon: "👥" },
      { title: "Total Properties", value: summary.totalProperties || 0, icon: "🏠" },
      { title: "Total Transactions", value: summary.totalTransactions || 0, icon: "💳" },
      { title: "Total Bookings", value: summary.totalBookings || 0, icon: "📅" },
      {
        title: "Revenue",
        value:
          window.Utils?.formatCurrency?.(summary.totalRevenue) ||
          `₹${Number(summary.totalRevenue || 0).toLocaleString("en-IN")}`,
        icon: "💰"
      }
    ];
  }

  container.innerHTML = stats.length
    ? stats.map((stat) => createStatCard(stat.title, stat.value, stat.icon)).join("")
    : `<div class="empty-state">No dashboard stats available</div>`;
}

/* =============================
   CREATE STAT CARD
============================= */

function createStatCard(title, value, icon) {
  return `
    <div class="dashboard-card">
      <div class="dashboard-stat-icon">${escapeHTML(icon)}</div>
      <h4>${escapeHTML(title)}</h4>
      <p class="dashboard-stat">${escapeHTML(value)}</p>
    </div>
  `;
}

/* =============================
   RECENT ACTIVITY
============================= */

async function loadRecentActivity() {
  const container = document.getElementById("recentActivity");
  if (!container) return;

  try {
    const res = await window.API.get("/dashboard/activity");
    const activities = Array.isArray(res?.data) ? res.data : [];

    if (!activities.length) {
      container.innerHTML = "<p class='muted-text'>No recent activity</p>";
      return;
    }

    container.innerHTML = activities
      .map((activity) => {
        const title = activity.title || capitalize(activity.type || "Activity");
        const description = activity.description || "Recent system activity";
        const time = activity.created_at || activity.time;

        return `
          <div class="activity-item">
            <strong>${escapeHTML(title)}</strong>
            <p class="muted-text">${escapeHTML(description)}</p>
            <span class="activity-time">${escapeHTML(formatActivityTime(time))}</span>
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p class='muted-text'>No recent activity</p>";
  }
}

/* =============================
   FORMAT ACTIVITY TIME
============================= */

function formatActivityTime(date) {
  if (!date) return "";

  const d = new Date(date);

  if (isNaN(d)) return "";

  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/* =============================
   TEXT HELPERS
============================= */

function capitalize(text) {
  const str = String(text || "");
  return str.charAt(0).toUpperCase() + str.slice(1);
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

window.initDashboard = initDashboard;
window.loadDashboardSummary = loadDashboardSummary;
window.loadRecentActivity = loadRecentActivity;