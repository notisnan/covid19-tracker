// -----------------------------------
// HELPER: Calculate percentage change
// -----------------------------------

export default function calculatePercentage(casesToday, casesTotal) {
  let percent = casesToday/casesTotal;
  if (isNaN(percent)) {
    return `0.00%`;
  } else {
    return `${(percent * 100).toFixed(2)}%`;
  }
}