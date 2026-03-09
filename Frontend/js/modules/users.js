// =============================
// USERS MODULE – REMS
// =============================

document.addEventListener("DOMContentLoaded", initUsers);

let allUsers = [];


/* =============================
INIT
============================= */

async function initUsers(){

const table = document.getElementById("userTable");

if(!table) return;

initFilters();

await loadUsers();

}


/* =============================
LOAD USERS
============================= */

async function loadUsers(){

const table = document.getElementById("userTable");

try{

showLoader?.();

table.innerHTML = `
<tr>
<td colspan="5" class="loading-state">
Loading users...
</td>
</tr>
`;

const users = await apiRequest("/users");

allUsers = users || [];

renderUsers(allUsers);

}
catch(err){

console.error(err);

notify?.("Failed to load users","error");

table.innerHTML = `
<tr>
<td colspan="5">Failed to load users</td>
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

function renderUsers(list){

const table = document.getElementById("userTable");

if(!list || list.length === 0){

table.innerHTML = `
<tr>
<td colspan="5">No users found</td>
</tr>
`;

return;

}

table.innerHTML = list.map(u => `

<tr>

<td>${escapeHTML(u.user_name)}</td>

<td>${escapeHTML(u.user_email)}</td>

<td>
<span class="badge ${getRoleClass(u.role)}">
${escapeHTML(u.role)}
</span>
</td>

<td>
<span class="badge ${u.is_active ? "badge--sale" : "badge--featured"}">
${u.is_active ? "Active" : "Inactive"}
</span>
</td>

<td>

<button class="btn btn--outline btn--small"
data-id="${u.user_id}">
View
</button>

</td>

</tr>

`).join("");

}



/* =============================
FILTER SYSTEM
============================= */

function initFilters(){

const searchInput = document.getElementById("searchUser");
const roleFilter = document.getElementById("roleFilter");
const statusFilter = document.getElementById("statusFilter");

if(searchInput){
searchInput.addEventListener("input", applyFilters);
}

if(roleFilter){
roleFilter.addEventListener("change", applyFilters);
}

if(statusFilter){
statusFilter.addEventListener("change", applyFilters);
}

}


function applyFilters(){

const search = document
.getElementById("searchUser")
?.value.toLowerCase();

const role = document
.getElementById("roleFilter")
?.value;

const status = document
.getElementById("statusFilter")
?.value;

let filtered = [...allUsers];

if(search){

filtered = filtered.filter(u =>

(u.user_name || "").toLowerCase().includes(search) ||
(u.user_email || "").toLowerCase().includes(search)

);

}

if(role){

filtered = filtered.filter(u => u.role === role);

}

if(status){

filtered = filtered.filter(u =>

status === "active" ? u.is_active : !u.is_active

);

}

renderUsers(filtered);

}



/* =============================
ROLE BADGE
============================= */

function getRoleClass(role){

if(!role) return "";

role = role.toLowerCase();

if(role === "admin") return "badge--sale";

if(role === "buyer") return "badge--rent";

if(role === "seller") return "badge--featured";

if(role === "agent") return "badge--featured";

return "";

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