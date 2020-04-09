// ----------------------------
// HELPER: format number for UI 
// ----------------------------

export default function formatNumber(number) {

  // ---------------
  // Up to a thousand
  // ---------------

  if (number < 1000) {
    return number;
  }

  // ---------------
  // Up to a million
  // ---------------

  if (number < 1000000) {
    let preDigit = String(number).split('');
    const removedDigits = Number(preDigit.slice(-2).join(''));

    preDigit.splice(-2);
    
    // If the removed digits are greater than 50, round last value up
    if (removedDigits >= 50) {
      const newValue = Number(preDigit.join('')) + 1;
      preDigit = String(newValue).split('');
    }

    preDigit.splice(preDigit.length-1, 0, '.');
    preDigit.push('<span>k</span>');
    return preDigit.join('');
  }

  // ---------------
  // Up to a billion
  // ---------------

  let preDigit = String(number).split('');
  const removedDigits = Number(preDigit.slice(-5).join(''));

  preDigit.splice(-5);

  // If the removed digits are greater than 50000, round last value up
  if (removedDigits >= 50000) {
    const newValue = Number(preDigit.join('')) + 1;
    preDigit = String(newValue).split('');
  }

  preDigit.splice(preDigit.length-1, 0, '.');
  preDigit.push('<span>m</span>');
  return preDigit.join('');
}