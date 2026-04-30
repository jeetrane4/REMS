// =============================
// LOAN APPLICATION MODULE
// =============================

document.addEventListener("DOMContentLoaded", initLoan);

function initLoan() {
  const btn = document.getElementById("applyLoanBtn");
  if (!btn) return;

  const propertyId = new URLSearchParams(window.location.search).get("id");

  if (!propertyId) {
    btn.disabled = true;
    return;
  }

  btn.addEventListener("click", async () => {
    const user = window.Storage?.getUser?.();

    if (!user) {
      window.notify?.("Please login to apply for loan", "error");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
      return;
    }

    if (user.role !== "buyer") {
      window.notify?.("Only buyers can apply for loan", "warning");
      return;
    }

    const loanAmount = prompt("Enter loan amount");
    if (!loanAmount) return;

    const annualIncome = prompt("Enter annual income", "500000") || "500000";
    const employmentType = prompt("Enter employment type", "Salaried") || "Salaried";

    btn.disabled = true;

    try {
      window.showLoader?.();

      await window.API.post("/loans/apply", {
        property_id: Number(propertyId),
        loan_amount: Number(loanAmount),
        annual_income: Number(annualIncome),
        employment_type: employmentType
      });

      window.notify?.("Loan application submitted successfully", "success");
    } catch (err) {
      console.error(err);
      window.notify?.(err.message || "Loan application failed", "error");
    } finally {
      window.hideLoader?.();
      btn.disabled = false;
    }
  });
}

window.initLoan = initLoan;