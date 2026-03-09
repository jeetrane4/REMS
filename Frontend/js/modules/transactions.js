// =============================
// TRANSACTIONS MODULE – REMS
// =============================

document.addEventListener("DOMContentLoaded", initTransactions);

let allTransactions = [];


/* =============================
INIT
============================= */

async function initTransactions(){

const table = document.getElementById("transactionTable");

if(!table) return;

initFilters();

await loadTransactions();

}


/* =============================
LOAD TRANSACTIONS
============================= */

async function loadTransactions(){

const table = document.getElementById("transactionTable");

try{

showLoader?.();

table.innerHTML = `
<tr>
<td colspan="6" class="loading-state">
Loading transactions...
</td>
</tr>
`;

const transactions = await apiRequest("/transactions");

allTransactions = transactions || [];

renderTransactions(allTransactions);

}
catch(err){

console.error(err);

notify?.("Failed to load transactions","error");

table.innerHTML = `
<tr>
<td colspan="6">Failed to load transactions</td>
</tr>
`;

}
finally{

hideLoader?.();

}

}



/* =============================
RENDER TABLE
============================= */

function renderTransactions(list){

const table = document.getElementById("transactionTable");

if(!list || list.length === 0){

table.innerHTML = `
<tr>
<td colspan="6">No transactions found</td>
</tr>
`;

return;

}

table.innerHTML = list.map(t => `

<tr>

<td>${t.transaction_id}</td>

<td>${escapeHTML(t.title || "Property")}</td>

<td>${escapeHTML(t.user_name || "User")}</td>

<td>${formatCurrency(t.amount)}</td>

<td>${formatDate(t.transaction_date)}</td>

<td>
<span class="badge ${getStatusClass(t.payment_status)}">
${escapeHTML(t.payment_status)}
</span>
</td>

</tr>

`).join("");

}



/* =============================
FILTER SYSTEM
============================= */

function initFilters(){

const searchInput = document.getElementById("searchTransaction");
const statusFilter = document.getElementById("statusFilter");

if(searchInput){

searchInput.addEventListener("input", applyFilters);

}

if(statusFilter){

statusFilter.addEventListener("change", applyFilters);

}

}


function applyFilters(){

const search = document
.getElementById("searchTransaction")
?.value.toLowerCase();

const status = document
.getElementById("statusFilter")
?.value;

let filtered = [...allTransactions];

if(search){

filtered = filtered.filter(t =>

(t.title || "").toLowerCase().includes(search) ||
(t.user_name || "").toLowerCase().includes(search)

);

}

if(status){

filtered = filtered.filter(t => t.payment_status === status);

}

renderTransactions(filtered);

}



/* =============================
STATUS BADGE
============================= */

function getStatusClass(status){

if(!status) return "";

status = status.toLowerCase();

if(status === "completed") return "badge--sale";

if(status === "pending") return "badge--rent";

if(status === "failed") return "badge--featured";

return "";

}



/* =============================
FORMAT DATE
============================= */

function formatDate(date){

if(!date) return "-";

return new Date(date).toLocaleDateString();

}



/* =============================
FORMAT CURRENCY
============================= */

function formatCurrency(amount){

if(!amount) return "₹0";

return "₹" + Number(amount).toLocaleString();

}



/* =============================
XSS PROTECTION
============================= */

function escapeHTML(str){

return str?.replace(/[&<>"']/g,function(m){

return({

"&":"&amp;",
"<":"&lt;",
">":"&gt;",
'"':"&quot;",
"'":"&#39;"

})[m];

});

}