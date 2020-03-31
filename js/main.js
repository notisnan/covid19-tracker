// -------------------------------
// Initializing the Refresh Button
// -------------------------------

const app = document.querySelector('.app');
const refreshButton = document.querySelector('.button-refresh');
refreshButton.addEventListener('click', refreshUI);

function refreshUI() {
  app.classList.add('refreshing');
  setTimeout(() => app.classList.remove('refreshing'), 800);

  updateData(initializeState);
}

// ---------------------
// Fetching country data
// ---------------------

let countryData = {};
let worldData = {};
let countryObj = {};
let userStorage = {};

function updateData(cb) {
  const fetchGlobalData = fetch('https://thevirustracker.com/free-api?global=stats').then(response => response.json());
  const fetchCountryData = fetch('https://thevirustracker.com/free-api?countryTotals=ALL').then(response => response.json());

  const fetchData = Promise.all([fetchGlobalData, fetchCountryData]);
  fetchData.then(data => {
    worldData = data[0].results[0];
    countryData = data[1].countryitems[0];
    buildCountryObject(countryData);

    // This will only trigger when both API requests return
    // We can now continue to modify the app
    cb();
  });
}

updateData(initializeState);

// ------------------------------------------------
// Initialize country array based on local storage 
    // TESTING OF SYNC STORAGE
    // chrome.storage.sync.remove('userStorage');
// ------------------------------------------------

function initializeState() {
  chrome.storage.sync.get('userStorage', function (result) {
    if (!result.userStorage) {
      userStorage.countries = topFive(countryObj);
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

// ---------------------------
// Build up the Country Object 
// ---------------------------

function buildCountryObject(data) {
  // key = Country Names, values = Country Object
  for (let [key, value] of Object.entries(data)) {
    if (value.title) {
      countryObj[value.title.toLowerCase()] = value;
    }
  }
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

// -----------------------------------------------------------------------
// Returns matched country
// Additionally - acts as a fail safe for user who mistypes a country name 
// -----------------------------------------------------------------------

function findCountry(country) {
  if (countryObj.hasOwnProperty(country.toLowerCase())) {
    return country.toLowerCase();
  }
  // TODO: check alternate country spelling object as a fail safe
}

// --------------------------------
// Rebuilds the UI - Countries List 
// --------------------------------

let countriesContainer = document.querySelector('.countries');

function rebuildTable() {
  let rows = '';

  sortCountries(userStorage.countries);
  
  for (let country of userStorage.countries) {
    rows += createRow(country, countryObj).outerHTML;
  }

  // Insert the global data as the first value manually on each rebuild
  rows = createRow(null, worldData).outerHTML + rows;
  
  countriesContainer.innerHTML = rows;
  activateDeleteButtons();
}

// ----------------
// Delete a Country
// ----------------

function deleteCountry(countryKey) {
  for (let i=0; i < userStorage.countries.length; i++) {
    if (countryObj[userStorage.countries[i]].ourid === Number(countryKey)) {
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
      deleteCountry(button.getAttribute('data-ourid'));
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
    <button class="${(itemData.ourid) ? 'remove-country' : 'remove-country remove-country--hidden'}" data-ourid="${itemData.ourid}">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve">
        <path d="M14,1.4L12.6,0L7,5.6L1.4,0L0,1.4L5.6,7L0,12.6L1.4,14L7,8.4l5.6,5.6l1.4-1.4L8.4,7L14,1.4z"/>
      </svg>
    </button>
    <div class="${(itemData.title.length < 20) ? 'country__name' : 'country__name country__name--small' }">${itemData.title}</div>
    <!-- Confirmed -->
    <div class="statistic column-confirmed">
      <div class="statistic__count">${formatNumber(itemData.total_cases)}</div>
      <div class="statistic__change">+${calculatePercentage(itemData.total_new_cases_today, itemData.total_cases)}%</div>
    </div>
    <!-- Deaths -->
    <div class="statistic column-deaths">
      <div class="statistic__count">${formatNumber(itemData.total_deaths)}</div>
      <div class="statistic__change">+${calculatePercentage(itemData.total_new_deaths_today, itemData.total_deaths)}%</div>
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
    if (countryObj[smallest].total_cases > countryObj[countryName].total_cases) smallest = countryName;
  }
  return smallest;
}

// --------------------------------------------------------
// Acquire the top four countries to initiate the extension 
// --------------------------------------------------------

function topFive(countries) {
  const mostCasesArray = ['botswana', 'botswana', 'botswana', 'botswana'];
  for (let key in countries) {  
    const leastCase = getSmallestValue(mostCasesArray);
    if (countries[leastCase].total_cases < countries[key].total_cases) {
      const indexOfLeastCase = mostCasesArray.indexOf(leastCase);
      mostCasesArray[indexOfLeastCase] = countryObj[key].title.toLowerCase();
    }
  }

  return mostCasesArray;
}

// ------------------------------
// HELPER: Sort the Country Array 
// ------------------------------

function sortCountries(array) {
  return array.sort((a, b) => {
    return countryObj[b].total_cases - countryObj[a].total_cases;
  });
}
