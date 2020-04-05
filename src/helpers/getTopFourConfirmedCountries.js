// --------------------------------------------------------
// HELPER: returns the smallest element of the passed array 
// --------------------------------------------------------

function getSmallestValue(countries) {
  let smallest = countries[0];
  for (let countryName of countries) {
    if (this.state.countryData[smallest].cases > this.state.countryData[countryName].cases) smallest = countryName;
  }
  return smallest;
}

// -------------------------------------------------------------
// Return array of 4 country names with the most confirmed cases
// -------------------------------------------------------------

export default function getTopFourConfirmedCountries(countries) {
  const mostCasesArray = ['botswana', 'botswana', 'botswana', 'botswana'];
  for (let key in countries) {  
    const leastCase = getSmallestValue(mostCasesArray);
    if (countries[leastCase].cases < countries[key].cases) {
      const indexOfLeastCase = mostCasesArray.indexOf(leastCase);
      mostCasesArray[indexOfLeastCase] = countries[key].title.toLowerCase();
    }
  }

  return mostCasesArray;
}