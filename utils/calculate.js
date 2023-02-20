const calculatePercentage = (total, value) => {
  return parseFloat(((value / total - 1) * 100).toFixed(2));
};
module.exports = {
  calculatePercentage,
};
