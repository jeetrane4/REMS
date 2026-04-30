// =============================
// USERS MODULE – REMS
// =============================

document.addEventListener("DOMContentLoaded", initUsers);

let allUsers = [];

/* =============================
   INIT
============================= */

async function initUsers() {
  const table = document.getElementById("userTable");
  if (!table) return;

  const user = window.Storage?.getUser?.();

  if (!user || user.role !== "admin") {
    window.location.href = "dashboard.html";
    return;
  }

  initFilters();
  await loadUsers();
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
   LOAD USERS
============================= */

async function loadUsers() {
  const table = document.getElementById("userTable");

  try {
    window.showLoader?.();

    table.innerHTML = `
      <tr>
        <td colspan="6" class="loading-state">Loading users...</td>
      </tr>
    `;

    const res = await window.API.get("/users");

    allUsers = getResponseData(res, []);
    window.allUsers = allUsers;
    renderUsers(allUsers);
  } catch (err) {
    console.error(err);

    window.notify?.("Failed to load users", "error");

    table.innerHTML = `
      <tr>
        <td colspan="6">Failed to load users</td>
      </tr>
    `;
  } finally {
    window.hideLoader?.();
  }
}

/* =============================
   RENDER TABLE
============================= */

function renderUsers(list) {
  const table = document.getElementById("userTable");
  if (!table) return;

  if (!list || list.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="6">No users found</td>
      </tr>
    `;
    return;
  }

  table.innerHTML = list
    .map((user) => {
      return `
        <tr>
          <td>${escapeHTML(user.user_id)}</td>

          <td>${escapeHTML(user.user_name || "-")}</td>

          <td>${escapeHTML(user.user_email || "-")}</td>

          <td>
            <span class="badge ${getRoleClass(user.role)}">
              ${escapeHTML(user.role || "-")}
            </span>
          </td>

          <td>
            <span class="badge ${user.is_active ? "badge--sale" : "badge--featured"}">
              ${user.is_active ? "Active" : "Inactive"}
            </span>
          </td>

          <td>
            <button
              class="btn btn--outline btn--small"
              onclick="viewUser(${Number(user.user_id)})"
            >
              View
            </button>

            <button
              class="btn btn--danger btn--small"
              onclick="deleteUser(${Number(user.user_id)})"
            >
              Delete
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

/* =============================
   VIEW USER
============================= */

function viewUser(userId) {
  const user = allUsers.find((item) => Number(item.user_id) === Number(userId));

  if (!user) {
    window.notify?.("User not found", "error");
    return;
  }

  alert(
    `User Details\n\nName: ${user.user_name}\nEmail: ${user.user_email}\nMobile: ${user.user_mobile || "-"}\nRole: ${user.role}\nActive: ${user.is_active ? "Yes" : "No"}`
  );
}

/* =============================
   DELETE USER
============================= */

async function deleteUser(userId) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    window.showLoader?.();

    await window.API.delete(`/users/${userId}`);

    window.notify?.("User deleted successfully", "success");

    allUsers = allUsers.filter((user) => Number(user.user_id) !== Number(userId));
    renderUsers(allUsers);
  } catch (err) {
    console.error(err);
    window.notify?.(err.message || "Failed to delete user", "error");
  } finally {
    window.hideLoader?.();
  }
}

/* =============================
   FILTER SYSTEM
============================= */

function initFilters() {
  const searchInput = document.getElementById("searchUser");
  const roleFilter = document.getElementById("roleFilter");
  const statusFilter = document.getElementById("statusFilter");

  if (searchInput) {
    searchInput.addEventListener(
      "input",
      window.Utils?.debounce?.(applyFilters, 250) || applyFilters
    );
  }

  if (roleFilter) {
    roleFilter.addEventListener("change", applyFilters);
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", applyFilters);
  }
}

function applyFilters() {
  const search = document
    .getElementById("searchUser")
    ?.value
    ?.toLowerCase()
    ?.trim();

  const role = document.getElementById("roleFilter")?.value;
  const status = document.getElementById("statusFilter")?.value;

  let filtered = [...allUsers];

  if (search) {
    filtered = filtered.filter((user) => {
      const name = String(user.user_name || "").toLowerCase();
      const email = String(user.user_email || "").toLowerCase();

      return name.includes(search) || email.includes(search);
    });
  }

  if (role) {
    filtered = filtered.filter((user) => user.role === role);
  }

  if (status) {
    filtered = filtered.filter((user) =>
      status === "active" ? user.is_active : !user.is_active
    );
  }

  renderUsers(filtered);
}

/* =============================
   ROLE BADGE
============================= */

function getRoleClass(role) {
  const value = String(role || "").toLowerCase();

  if (value === "admin") return "badge--sale";
  if (value === "buyer") return "badge--rent";
  if (value === "seller") return "badge--featured";
  if (value === "agent") return "badge--featured";

  return "";
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

window.loadUsers = loadUsers;
window.viewUser = viewUser;
window.deleteUser = deleteUser;