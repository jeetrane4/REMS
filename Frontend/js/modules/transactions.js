// =============================
// TRANSACTIONS MODULE – REMS
// =============================

document.addEventListener("DOMContentLoaded", initTransactions);

let allTransactions = [];

/* =============================
   INIT
============================= */

async function initTransactions() {
  const table = document.getElementById("transactionTable");
  if (!table) return;

  initFilters();
  await loadTransactions();
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
   LOAD TRANSACTIONS
============================= */

async function loadTransactions() {
  const table = document.getElementById("transactionTable");

  try {
    window.showLoader?.();

    table.innerHTML = `
      <tr>
        <td colspan="6" class="loading-state">
          Loading transactions...
        </td>
      </tr>
    `;

    const res = await window.API.get("/transactions");

    allTransactions = getResponseData(res, []);

    renderTransactions(allTransactions);
  } catch (err) {
    console.error(err);

    window.notify?.("Failed to load transactions", "error");

    table.innerHTML = `
      <tr>
        <td colspan="6">Failed to load transactions</td>
      </tr>
    `;
  } finally {
    window.hideLoader?.();
  }
}

/* =============================
   RENDER TABLE
============================= */

function renderTransactions(list) {
  const table = document.getElementById("transactionTable");
  if (!table) return;

  if (!list || list.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="6">No transactions found</td>
      </tr>
    `;
    return;
  }

  table.innerHTML = list
    .map((transaction) => {
      const propertyTitle =
        transaction.property_title ||
        transaction.title ||
        "Property";

      const party =
        transaction.buyer_name ||
        transaction.seller_name ||
        transaction.buyer ||
        "User";

      return `
        <tr>
          <td>${escapeHTML(transaction.transaction_id)}</td>

          <td>
            <a href="listing-details.html?id=${escapeHTML(transaction.property_id)}" class="table-link">
              ${escapeHTML(propertyTitle)}
            </a>
          </td>

          <td>${escapeHTML(party)}</td>

          <td>
            ${
              window.Utils?.formatCurrency?.(transaction.amount) ||
              formatCurrency(transaction.amount)
            }
          </td>

          <td>
            ${
              window.Utils?.formatDate?.(transaction.transaction_date) ||
              formatDate(transaction.transaction_date)
            }
          </td>

          <td>
            <span class="badge ${getStatusClass(transaction.payment_status)}">
              ${escapeHTML(transaction.payment_status || "pending")}
            </span>
          </td>
        </tr>
      `;
    })
    .join("");
}

/* =============================
   FILTER SYSTEM
============================= */

function initFilters() {
  const searchInput = document.getElementById("searchTransaction");
  const statusFilter = document.getElementById("statusFilter");

  if (searchInput) {
    searchInput.addEventListener(
      "input",
      window.Utils?.debounce?.(applyFilters, 250) || applyFilters
    );
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", applyFilters);
  }
}

function applyFilters() {
  const search = document
    .getElementById("searchTransaction")
    ?.value
    ?.toLowerCase()
    ?.trim();

  const status = document
    .getElementById("statusFilter")
    ?.value
    ?.toLowerCase();

  let filtered = [...allTransactions];

  if (search) {
    filtered = filtered.filter((transaction) => {
      const propertyTitle = String(
        transaction.property_title || transaction.title || ""
      ).toLowerCase();

      const buyerName = String(transaction.buyer_name || "").toLowerCase();
      const sellerName = String(transaction.seller_name || "").toLowerCase();

      return (
        propertyTitle.includes(search) ||
        buyerName.includes(search) ||
        sellerName.includes(search)
      );
    });
  }

  if (status) {
    filtered = filtered.filter(
      (transaction) =>
        String(transaction.payment_status || "").toLowerCase() === status
    );
  }

  renderTransactions(filtered);
}

/* =============================
   STATUS BADGE
============================= */

function getStatusClass(status) {
  const value = String(status || "").toLowerCase();

  if (value === "completed") return "badge--sale";
  if (value === "pending") return "badge--rent";
  if (value === "failed") return "badge--featured";
  if (value === "cancelled") return "badge--error";

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
   FORMAT CURRENCY
============================= */

function formatCurrency(amount) {
  const value = Number(amount);
  if (isNaN(value)) return "₹0";
  return "₹" + value.toLocaleString("en-IN");
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

window.loadTransactions = loadTransactions;
window.renderTransactions = renderTransactions;