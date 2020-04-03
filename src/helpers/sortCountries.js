// ------------------------------
// HELPER: Sort the Country Array 
// ------------------------------

export default function sortCountries(array, countryData) {
  return array.sort((a, b) => {
    return countryData[b].cases - countryData[a].cases;
  });
}