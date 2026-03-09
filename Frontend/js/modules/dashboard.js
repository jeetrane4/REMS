// =============================
// DASHBOARD MODULE – REMS
// =============================

document.addEventListener("DOMContentLoaded", initDashboard);


async function initDashboard(){

const token = Storage.getToken();
const user = Storage.getUser();

if(!token || !user){

window.location.href="login.html";
return;

}

setGreeting(user);

applyRoleUI(user);

await loadDashboardSummary(user);

await loadRecentActivity();

}



/* =============================
USER GREETING
============================= */

function setGreeting(user){

const title = document.getElementById("dashboardTitle");
const subtitle = document.getElementById("dashboardSubtitle");

if(!user) return;

if(title){
title.textContent = `Welcome back, ${user.name} 👋`;
}

if(subtitle){
subtitle.textContent = "Manage your activities and overview";
}

}



/* =============================
ROLE BASED UI
============================= */

function applyRoleUI(user){

if(!user) return;

const role = user.role;

document.querySelectorAll("[data-role]").forEach(el=>{

const allowed = el.getAttribute("data-role").split(",");

if(!allowed.includes(role)){
el.style.display = "none";
}

});

}



/* =============================
LOAD DASHBOARD SUMMARY
============================= */

async function loadDashboardSummary(user){

const container = document.getElementById("dashboardSummary");

if(!container) return;

try{

showLoader?.();

const summary = await apiRequest("/dashboard");

renderStats(container, summary, user.role);

}
catch(err){

console.error(err);

container.innerHTML = `
<div class="empty-state">
Failed to load dashboard data
</div>
`;

notify?.("Failed to load dashboard summary","error");

}
finally{

hideLoader?.();

}

}



/* =============================
RENDER STATS
============================= */

function renderStats(container, summary, role){

let stats = [];

if(role === "buyer"){

stats = [

{title:"My Bookings", value:summary.totalBookings || 0, icon:"📅"},
{title:"Saved Properties", value:summary.savedProperties || 0, icon:"❤️"}

];

}

else if(role === "seller" || role === "agent"){

stats = [

{title:"My Properties", value:summary.totalProperties || 0, icon:"🏠"},
{title:"Bookings Received", value:summary.totalBookings || 0, icon:"📅"},
{title:"Transactions", value:summary.totalTransactions || 0, icon:"💰"}

];

}

else if(role === "admin"){

stats = [

{title:"Total Users", value:summary.totalUsers || 0, icon:"👥"},
{title:"Total Properties", value:summary.totalProperties || 0, icon:"🏠"},
{title:"Total Transactions", value:summary.totalTransactions || 0, icon:"💳"},
{title:"Total Bookings", value:summary.totalBookings || 0, icon:"📅"}

];

}

container.innerHTML = stats
.map(stat => createStatCard(stat.title, stat.value, stat.icon))
.join("");

}



/* =============================
CREATE STAT CARD
============================= */

function createStatCard(title, value, icon){

return `

<div class="dashboard-card">

<div class="dashboard-stat-icon">${icon}</div>

<h4>${title}</h4>

<p class="dashboard-stat">${value}</p>

</div>

`;

}



/* =============================
RECENT ACTIVITY
============================= */

async function loadRecentActivity(){

const container = document.getElementById("recentActivity");

if(!container) return;

try{

const activities = await apiRequest("/dashboard/activity");

if(!activities || activities.length === 0){

container.innerHTML = "<p class='muted-text'>No recent activity</p>";
return;

}

container.innerHTML = activities.map(a => `

<div class="activity-item">

<strong>${escapeHTML(a.title)}</strong>

<p class="muted-text">${escapeHTML(a.description)}</p>

<span class="activity-time">${formatActivityTime(a.time)}</span>

</div>

`).join("");

}
catch(err){

console.error(err);

container.innerHTML = "<p class='muted-text'>No recent activity</p>";

}

}



/* =============================
FORMAT ACTIVITY TIME
============================= */

function formatActivityTime(date){

if(!date) return "";

return new Date(date).toLocaleString();

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