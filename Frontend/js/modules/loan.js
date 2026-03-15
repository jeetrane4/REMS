// =============================
// LOAN APPLICATION MODULE
// =============================

document.addEventListener("DOMContentLoaded", initLoan);

function initLoan(){

const btn = document.getElementById("applyLoanBtn");

if(!btn) return;

const params = new URLSearchParams(window.location.search);

const propertyId = params.get("id");

btn.addEventListener("click", async ()=>{

const amount = prompt("Enter loan amount");

if(!amount) return;

try{

await apiRequest("/loan/apply","POST",{

property_id:propertyId,
loan_amount:amount,
annual_income:500000,
employment_type:"Salaried"

});

notify("Loan application submitted","success");

}
catch(err){

console.error(err);

notify("Loan application failed","error");

}

});

}