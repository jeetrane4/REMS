exports.calculateCommission = (amount) => {
  const commissionRate = 0.02; // 2%
  return amount * commissionRate;
};