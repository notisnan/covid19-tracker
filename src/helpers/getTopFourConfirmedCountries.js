export default function getTopFourConfirmedCountries(countries) {
  const mostCasesArray = ['botswana', 'botswana', 'botswana', 'botswana'];
  for (let key in countries) {  
    const leastCase = this.getSmallestValue(mostCasesArray);
    if (countries[leastCase].cases < countries[key].cases) {
      const indexOfLeastCase = mostCasesArray.indexOf(leastCase);
      mostCasesArray[indexOfLeastCase] = countries[key].title.toLowerCase();
    }
  }

  return mostCasesArray;
}