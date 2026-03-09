// =============================
// NAVBAR CONTROLLER
// =============================

function initNavbar(){

handleAuthVisibility();
handleRoleLinks();
handleLogout();
handleProfileDropdown();
handleMobileToggle();
handleScrollEffect();
setActiveNavLink();
setProfileName();

}

/* PROFILE NAME */

function setProfileName(){

const user = Storage.getUser();
const profileName = document.getElementById("profileName");

if(user && profileName){
profileName.textContent = user.name || user.email || "Account";
}

}

/* AUTH VISIBILITY */

function handleAuthVisibility(){

const token = Storage.getToken();

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const profileMenu = document.getElementById("profileMenu");

if(!loginBtn || !registerBtn || !profileMenu) return;

if(token){

loginBtn.classList.add("hidden");
registerBtn.classList.add("hidden");
profileMenu.classList.remove("hidden");

}else{

loginBtn.classList.remove("hidden");
registerBtn.classList.remove("hidden");
profileMenu.classList.add("hidden");

}

}

/* LOGOUT */

function handleLogout(){

const logoutBtn = document.getElementById("logoutBtn");

if(!logoutBtn) return;

logoutBtn.addEventListener("click",()=>{

Storage.clear();
window.location.href = "index.html";

});

}

/* ROLE LINKS */

function handleRoleLinks(){

const user = Storage.getUser();
const token = Storage.getToken();

if(!user || !token) return;

const role = user.role;

const myListingsLink = document.getElementById("myListingsLink");
const myBookingsLink = document.getElementById("myBookingsLink");
const adminLink = document.getElementById("adminLink");
const postPropertyBtn = document.getElementById("postPropertyBtn");

if(role === "buyer"){

if(myBookingsLink) myBookingsLink.classList.remove("hidden");

if(myListingsLink) myListingsLink.remove();
if(postPropertyBtn) postPropertyBtn.remove();

}

if(["seller","agent"].includes(role)){

if(myListingsLink) myListingsLink.classList.remove("hidden");
if(postPropertyBtn) postPropertyBtn.classList.remove("hidden");

}

if(role === "admin"){

if(adminLink) adminLink.classList.remove("hidden");

}

}

/* PROFILE DROPDOWN */

function handleProfileDropdown(){

const toggle = document.getElementById("profileToggle");
const menu = document.getElementById("dropdownMenu");

if(!toggle || !menu) return;

toggle.addEventListener("click",(e)=>{

e.stopPropagation();
menu.classList.toggle("open");

});

document.addEventListener("click",(e)=>{

if(!menu.contains(e.target) && e.target !== toggle){
menu.classList.remove("open");
}

});

}

/* MOBILE NAV */

function handleMobileToggle(){

const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");

if(!navToggle || !mainNav) return;

navToggle.addEventListener("click",()=>{
mainNav.classList.toggle("nav--open");
});

}

/* SCROLL EFFECT */

function handleScrollEffect(){

const header = document.querySelector(".app-header");

if(!header) return;

window.addEventListener("scroll",()=>{

if(window.scrollY > 10){
header.classList.add("scrolled");
}else{
header.classList.remove("scrolled");
}

});

}

/* ACTIVE LINK */

function setActiveNavLink(){

const links = document.querySelectorAll(".nav a");
const current = window.location.pathname.split("/").pop();

links.forEach(link=>{

const href = link.getAttribute("href");

if(href === current){
link.classList.add("active");
}

});

}