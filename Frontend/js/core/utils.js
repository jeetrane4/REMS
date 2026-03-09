// =============================
// UTILITIES
// =============================

function formatCurrency(amount){
if(amount === null || amount === undefined) return "₹0";
return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function formatDate(date){
if(!date) return "-";
return new Date(date).toLocaleDateString("en-IN");
}

function capitalize(text){
if(!text) return "";
return text.charAt(0).toUpperCase() + text.slice(1);
}

function debounce(fn, delay = 300){

let timeout;

return (...args)=>{

clearTimeout(timeout);

timeout = setTimeout(()=>fn(...args), delay);

};

}

function qs(selector){
return document.querySelector(selector);
}

function qsa(selector){
return document.querySelectorAll(selector);
}