import headers from './headers.js';

// --------------------------
// Start up custom scrollbars
// --------------------------

OverlayScrollbars(document.querySelector('.app__body'), {className: 'os-theme-thick-light'});

// -------------------------------
// Initializing the Refresh Button
// -------------------------------

const app = document.querySelector('.app');
const refreshButton = document.querySelector('.button-refresh');
const refreshButtonSvg = document.querySelector('.button-refresh__svg');
let refreshIconRotation = 0;

refreshButton.addEventListener('click', refreshUI);
refreshButtonSvg.addEventListener('transitionend', continueSpinning);

function refreshUI() {
  app.classList.add('app--refreshing');

  // Start the rotate button spinning
  // When the data comes back, make sure the last spin gets to finish
  refreshIconRotation += 360;
  refreshButtonSvg.style.transform = `rotate(${refreshIconRotation}deg)`;

  updateData(initializeState);
}

// -----------
// List toggle
// -----------

const listToggle = document.querySelector('.country-toggle');
const myCountries = document.querySelector('.my-countries');
const allCountries = document.querySelector('.all-countries');

listToggle.addEventListener('click', listToggleClick);

function listToggleClick() {
  app.classList.toggle('app--all-countries');
  myCountries.classList.toggle('my-countries--hide');
  allCountries.classList.toggle('all-countries--hide');
  listToggle.classList.toggle('country-toggle--right');
}

// --------------------------------------------------------------------
// Should the refresh icon continue spinning? Or is has the data loaded
// --------------------------------------------------------------------

function continueSpinning() {
  if (app.classList.contains('app--refreshing')) {
    refreshIconRotation += 360;
    refreshButtonSvg.style.transform = `rotate(${refreshIconRotation}deg)`;
  }
}

// ---------------------
// Fetching country data
// ---------------------

let countryData = {};
let worldData = {};
let userStorage = {};

function updateData(cb) {
  const fetchGlobalData = fetch('https://coronavirus-monitor.p.rapidapi.com/coronavirus/worldstat.php', {
    headers: headers
  }).then(response => response.json());
  const fetchCountryData = fetch('https://coronavirus-monitor.p.rapidapi.com/coronavirus/cases_by_country.php', {
    headers: headers
  }).then(response => response.json());

  // Disable UI when fetching data
  app.classList.add('app--disabled');

  const fetchData = Promise.all([fetchGlobalData, fetchCountryData]);
  fetchData.then(data => {

    // Normalizes our data to follow our own strcture
    updateWorldData(data[0]);
    updateCountryData(data[1]['countries_stat']);
    createAltSpellingsObj();

    // Enable UI when fetching data complete
    app.classList.remove('app--disabled');

    // This will only trigger when both API requests return
    // We can now continue to modify the app
    cb();
  }).catch(error => {
    // Something went wrong with the API calls
    app.classList.add('app--error');
    console.log(error);
  });
}

updateData(initializeState);

// --------------------
// Normalize world data
// --------------------

function updateWorldData(data) {
  worldData.cases = Number(data.total_cases.split(',').join('')),
  worldData.deaths = Number(data.total_deaths.split(',').join('')),
  worldData.new_cases = Number(data.new_cases.split(',').join('')),
  worldData.new_deaths = Number(data.new_deaths.split(',').join('')),
  worldData.total_recovered = Number(data.total_recovered.split(',').join('')),
  worldData.title = 'Global'
}

// ----------------------
// Normalize country data
// ----------------------

function updateCountryData(data) {
  data.forEach(item => {
    countryData[item.country_name.toLowerCase()] = {
      cases: Number(item.cases.split(',').join('')),
      deaths: Number(item.deaths.split(',').join('')),
      total_recovered: Number(item.total_recovered.split(',').join('')),
      new_cases: Number(item.new_cases.split(',').join('')),
      new_deaths: Number(item.new_deaths.split(',').join('')),
      title: item.country_name
    }
  });
}

// -------------------------
// Populate all country data
// -------------------------

const allCountriesList = document.querySelector('.all-countries');

function populateAllCountries() {
  let rows = '';

  const sortedCountries = sortCountries(Object.keys(countryData));
  
  for (let country of sortedCountries) {
    rows += createRow(country, countryData).outerHTML;
  }

  // // Insert the global data as the first value manually on each rebuild
  rows = createRow(null, worldData).outerHTML + rows;

  allCountriesList.innerHTML = rows;
}

// ------------------------------------------------
// Initialize country array based on local storage 
    // TESTING OF SYNC STORAGE
    // chrome.storage.sync.remove('userStorage');
// ------------------------------------------------

function initializeState() {
  chrome.storage.sync.get('userStorage', function (result) {
    if (!result.userStorage) {
      userStorage.countries = topFive();
      chrome.storage.sync.set({ 'userStorage': userStorage });
      // console.log('User had no preferences saved.');
    }
    else {
      userStorage = result.userStorage;
      // console.log('User has preferences saved.');
    }
    
    rebuildTable();
  });
}

// --------------------
// Adding new countries 
// --------------------

const addCountryForm = document.querySelector('.country-form');
const addCountryInput = document.querySelector('.country-form__input');
const addCountryButton = document.querySelector('.country-form__button');
const errorField = document.querySelector('.country-form__error');
let latestCountryAdded = null;

addCountryButton.addEventListener('click', addCountry);

function addCountry(e) {
  const newCountry = findCountry(addCountryInput.value);
  e.preventDefault();

  // ------------------------------
  // Country is already in the list
  // ------------------------------

  if (userStorage.countries.includes(newCountry)) {
    // Update and show the error for a bit, then hide it
    errorField.innerHTML = 'Country is already in your list';
    addCountryForm.classList.add('country-form--error');
    setTimeout(() => {
      addCountryForm.classList.remove('country-form--error');
    }, 1500);
  }

  // -----------------------
  // Add country to the list
  // -----------------------

  else if (newCountry) {
    latestCountryAdded = newCountry;
    userStorage.countries.push(newCountry);
    chrome.storage.sync.set({ 'userStorage': userStorage });
    rebuildTable();

    // Remove the latest country highlight
    setTimeout(() => {
      const lastCountryAdded = document.querySelector('.country--added');
      lastCountryAdded.classList.remove('country--added');
    }, 200);

    addCountryInput.value = "";
  }

  // -------------
  // Invalid input
  // -------------

  else {
    // Update and show the error for a bit, then hide it
    errorField.innerHTML = 'Invalid country name';
    addCountryForm.classList.add('country-form--error');
    setTimeout(() => {
      addCountryForm.classList.remove('country-form--error');
    }, 1500);
  }
}

// ---------------------------
// Alternate country spellings
// ---------------------------

let alternateSpellings = {};

function createAltSpellingsObj() {
  alternateSpellings = {
    // If you want to add an alternative spelling just add it below and point to the right country
    'us': countryData['usa'],
    'united states': countryData['usa'],
    'united states of america': countryData['usa'],
    'democratic republic of congo': countryData['drc'],
  };
}

// -----------------------------------------------------------------------
// Returns matched country
// Additionally - acts as a fail safe for user who mistypes a country name 
// -----------------------------------------------------------------------

function findCountry(country) {
  country = country.toLowerCase();

  if (countryData.hasOwnProperty(country)) {
    return country;
  }
  
  // Check alternate spellings
  if (alternateSpellings.hasOwnProperty(country)) {
    return alternateSpellings[country].title.toLowerCase();
  }
}

// --------------------------------
// Rebuilds the UI - Countries List 
// --------------------------------

let countriesContainer = document.querySelector('.countries');

function rebuildTable() {
  let rows = '';

  sortCountries(userStorage.countries);
  
  for (let country of userStorage.countries) {
    rows += createRow(country, countryData).outerHTML;
  }

  // Insert the global data as the first value manually on each rebuild
  rows = createRow(null, worldData).outerHTML + rows;
  
  // Reset the UI loading states
  app.classList.remove('app--loading');
  app.classList.remove('app--refreshing');

  countriesContainer.innerHTML = rows;
  activateDeleteButtons();

  // Also repopulate all country list
  populateAllCountries();
}

// ----------------
// Delete a Country
// ----------------

function deleteCountry(countryKey) {
  for (let i=0; i < userStorage.countries.length; i++) {
    if (countryData[userStorage.countries[i]].title.toLowerCase() === countryKey) {
      userStorage.countries.splice(i, 1);
      chrome.storage.sync.set({ 'userStorage': userStorage });
      rebuildTable();
      return;
    }
  }
}

// -----------------------------------------------------------------
// Activate the event listeners for the delete country functionality 
// -----------------------------------------------------------------

function activateDeleteButtons() {
  const deleteButtons = document.querySelectorAll('.remove-country');
  for (let button of [...deleteButtons]) {
    button.addEventListener('click', () => {
      deleteCountry(button.getAttribute('data-name'));
    });
  }
}

// -------------------------
// Create a New Country Road 
// -------------------------

function createRow(item, itemSet) {
  const itemData = (item) ? itemSet[item] : itemSet;
  const div = document.createElement('div');
  div.classList.add('country');

  // If the item doesn't have a title we know it's global
  // To prevent too many if checks below, we just set a title on Global
  if (!itemData.title) itemData.title = 'Global';
  
  // If this country as just added, highlight it
  if (latestCountryAdded !== null) {
    if (latestCountryAdded === itemData.title.toLowerCase()) {
      div.classList.add('country--added');
      latestCountryAdded = null;
    }
  }

  div.innerHTML = `
    <button class="${(itemData.title !== 'Global') ? 'remove-country' : 'remove-country remove-country--hidden'}" data-name="${itemData.title.toLowerCase()}">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve">
        <path d="M14,1.4L12.6,0L7,5.6L1.4,0L0,1.4L5.6,7L0,12.6L1.4,14L7,8.4l5.6,5.6l1.4-1.4L8.4,7L14,1.4z"/>
      </svg>
    </button>
    <div class="${(itemData.title.length < 20) ? 'country__name' : 'country__name country__name--small' }">${itemData.title}</div>
    <!-- Confirmed -->
    <div class="statistic column-confirmed">
      <div class="statistic__count">${formatNumber(itemData.cases)}</div>
      <div class="statistic__change">+${calculatePercentage(itemData.new_cases, itemData.cases)}%</div>
    </div>
    <!-- Deaths -->
    <div class="statistic column-deaths">
      <div class="statistic__count">${formatNumber(itemData.deaths)}</div>
      <div class="statistic__change">+${calculatePercentage(itemData.new_deaths, itemData.deaths)}%</div>
    </div>
    <!-- Recovered -->
    <div class="statistic column-recovered">
      <div class="statistic__count">${formatNumber(itemData.total_recovered)}</div>
      <div class="statistic__change"></div>
    </div>
  `;
  return div;
}

// -----------------------------------
// HELPER: Calculate percentage change
// -----------------------------------

function calculatePercentage(casesToday, casesTotal) {
  let percent = casesToday/casesTotal;
  if (isNaN(percent)) {
    return "0.00";
  } else {
    return (percent * 100).toFixed(2);
  }
}

// ----------------------------
// HELPER: format number for UI 
// ----------------------------

function formatNumber(number) {

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

// --------------------------------------------------------
// HELPER: returns the smallest element of the passed array 
// --------------------------------------------------------

function getSmallestValue(countries) {
  let smallest = countries[0];
  for (let countryName of countries) {
    if (countryData[smallest].cases > countryData[countryName].cases) smallest = countryName;
  }
  return smallest;
}

// --------------------------------------------------------
// Acquire the top four countries to initiate the extension 
// --------------------------------------------------------

function topFive() {
  const mostCasesArray = ['botswana', 'botswana', 'botswana', 'botswana'];
  for (let key in countryData) {  
    const leastCase = getSmallestValue(mostCasesArray);
    if (countryData[leastCase].cases < countryData[key].cases) {
      const indexOfLeastCase = mostCasesArray.indexOf(leastCase);
      mostCasesArray[indexOfLeastCase] = countryData[key].title.toLowerCase();
    }
  }

  return mostCasesArray;
}

// ------------------------------
// HELPER: Sort the Country Array 
// ------------------------------

function sortCountries(array) {
  return array.sort((a, b) => {
    return countryData[b].cases - countryData[a].cases;
  });
}
