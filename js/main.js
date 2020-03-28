// --------------------------
// Show/Hide add country form
// --------------------------

const addCountryButton = document.querySelector('.button-add-country');
const countryForm = document.querySelector('.country-form');

addCountryButton.addEventListener('click', toggleForm);

function toggleForm() {
  this.classList.toggle('button-add-country--active');
  countryForm.classList.toggle('country-form--active');
}

// --------------------------
// Fetching country data
// --------------------------
let countryObj = {};
let topFiveCountries = [];

fetch('https://thevirustracker.com/free-api?countryTotals=ALL')
.then((response) => {
  return response.json();
})
.then((data) => {  
  for (let [key, value] of Object.entries(data.countryitems[0])) {
    countryObj[value.title] = value;
  }
  topFiveCountries = topFive(countryObj);
});

// define a function [smallestValue] to find the smallest item 
// in smallestCountries object
const getSmallestValue = (countries) => {
  let smallest = countries[0];
  for (let country of countries) {
    if (smallest.total_cases > country.total_cases) smallest = country;
  }
  return smallest;
}

const topFive = (countries) => {    
  // declare an array of objects - smallestCountries
  const sampleCountry = countries["Botswana"];
  const mostCasesArray = [sampleCountry, sampleCountry, sampleCountry, sampleCountry, sampleCountry];
  // iterate thru parameter: countryObj
  for (let key in countries) {  
    // select total cases of current iterated element in order
    // to compare to smallest cases in smallestCountries by calling smallestValue
    const leastCase = getSmallestValue(mostCasesArray);
    if (leastCase.total_cases < countries[key].total_cases) {
      const indexOfLeastCase = mostCasesArray.indexOf(leastCase);
      mostCasesArray[indexOfLeastCase] = countryObj[key];
    }
  }

  return mostCasesArray.sort((a,b) => {
    return b.total_cases - a.total_cases;  
  });
}



