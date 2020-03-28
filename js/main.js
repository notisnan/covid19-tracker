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
let countriesContainer = document.querySelector('.countries');

fetch('https://thevirustracker.com/free-api?countryTotals=ALL')
.then((response) => {
  return response.json();
})
.then((data) => {  
  for (let [key, value] of Object.entries(data.countryitems[0])) {
    countryObj[value.title] = value;
  }
  topFiveCountries = topFive(countryObj);
  // loop over top fiove countries
  for (let country of topFiveCountries) {
    // for each country create a row element with all data populated - invoke the createRow(country)
    // append that row to the countries element
    countriesContainer.appendChild(createRow(country));
  }
});

  // define a function that takes an object 
  // and in this function [createRow] return an element - that has all the data populated
  // 1. create a new div
  // 2. assign a class to that div element > country
  // 3. set the InnerHTML of this element to the structure of that row 
  // 4. Inside that structure replace all values from our object
  // 5. return this element
function createRow(country) {
  const div = document.createElement('div');
  div.classList.add('country');
  div.innerHTML = `
    <button class="remove-country">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve">
        <path d="M14,1.4L12.6,0L7,5.6L1.4,0L0,1.4L5.6,7L0,12.6L1.4,14L7,8.4l5.6,5.6l1.4-1.4L8.4,7L14,1.4z"/>
      </svg>
    </button>
    <div class="country__name">${country.title}</div>
    <!-- Confirmed -->
    <div class="statistic column-confirmed">
      <div class="statistic__count">${formatNumber(country.total_cases)}</div>
      <div class="statistic__change">+${((country.total_new_cases_today/country.total_cases)*100).toFixed(2)}%</div>
    </div>
    <!-- Deaths -->
    <div class="statistic column-deaths">
      <div class="statistic__count">${formatNumber(country.total_deaths)}</div>
      <div class="statistic__change">+${((country.total_new_deaths_today/country.total_deaths)*100).toFixed(2)}%</div>
    </div>
    <!-- Recovered -->
    <div class="statistic column-recovered">
      <div class="statistic__count">${formatNumber(country.total_recovered)}</div>
      <div class="statistic__change"></div>
    </div>
  `;
  return div;
}

// Write a function that formatNumber(number) 
// 1. check if the value < 1000 => return value
// 2. check if the value < 1,000,000 => 746,543 -> remove last 2 digits, dot after last remaining digit + 'k' in a span
// 3. check if the value < 1,000,000,000 -> remove last 5 digits, dot after last remaining digit + 'm' in a span
// 4. return the string
function formatNumber(number) {
  if (number < 1000) {
    return number;
  }
  if (number < 1000000) {
    const preDigit = String(number).split('');
    preDigit.splice(-2);
    preDigit.splice(preDigit.length-1, 0, '.');
    preDigit.push('<span>k</span>');
    return preDigit.join('');
  }
  const preDigit = String(number).split('');
  preDigit.splice(-5);
  preDigit.splice(preDigit.length-1, 0, '.');
  preDigit.push('<span>m</span>');
  return preDigit.join('');
}


// define a function [smallestValue] to find the smallest item 
// in smallestCountries object
function getSmallestValue(countries) {
  let smallest = countries[0];
  for (let country of countries) {
    if (smallest.total_cases > country.total_cases) smallest = country;
  }
  return smallest;
}

function topFive(countries) {    
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



