// --------------------------------------------------------
// HELPER: returns the smallest element of the passed array 
// --------------------------------------------------------

function getSmallestValue(array, countries) {
  let smallest = array[0];
  for (let countryName of array) {
    if (countries[smallest].confirmed > countries[countryName].confirmed) smallest = countryName;
  }
  return smallest;
}

// -------------------------------------------------------------
// Return array of 4 country names with the most confirmed cases
// -------------------------------------------------------------

export default function getTopFourConfirmedCountries(countries) {
  const mostCasesArray = ['botswana', 'botswana', 'botswana', 'botswana'];
  for (let key in countries) {  
    const leastCase = getSmallestValue(mostCasesArray, countries);
    if (countries[leastCase].confirmed < countries[key].confirmed) {
      const indexOfLeastCase = mostCasesArray.indexOf(leastCase);
      mostCasesArray[indexOfLeastCase] = countries[key].title.toLowerCase();
    }
  }

  return mostCasesArray;
}