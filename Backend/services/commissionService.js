/*
  Commission Service
  Handles commission calculations for transactions
*/

const DEFAULT_COMMISSION_RATE = 0.02; // 2%

/* =============================
   CALCULATE COMMISSION
============================= */

exports.calculateCommission = (amount, rate = DEFAULT_COMMISSION_RATE) => {
  const numericAmount = Number(amount);

  if (!numericAmount || numericAmount <= 0) {
    return 0;
  }

  const commission = numericAmount * rate;

  return Number(commission.toFixed(2)); // precision for money
};

/* =============================
   DETAILED BREAKDOWN
============================= */

exports.calculateBreakdown = (amount, rate = DEFAULT_COMMISSION_RATE) => {
  const numericAmount = Number(amount);

  if (!numericAmount || numericAmount <= 0) {
    return {
      amount: 0,
      commission: 0,
      sellerReceives: 0
    };
  }

  const commission = Number((numericAmount * rate).toFixed(2));
  const sellerReceives = Number((numericAmount - commission).toFixed(2));

  return {
    amount: numericAmount,
    commission,
    sellerReceives
  };
};