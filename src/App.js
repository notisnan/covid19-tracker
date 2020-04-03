import React from 'react';
import './App.css';

// Custom Scrollbars
import './css/OverlayScrollbars.css';
import './css/os-theme-thick-light.css';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';


// Components
import CountryToggle from './components/CountryToggle.js';
import CountriesHeadings from './components/CountriesHeadings.js';
import CountryForm from './components/CountryForm.js';
import RefreshButton from './components/RefreshButton.js';
import CountryRow from './components/CountryRow.js';
import headers from './headers.js';

// Helper Functions
import sortCountries from './helpers/sortCountries.js';

// Images
import './images/loader.gif';

// ---
// App
// ---

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      worldData: {},
      countryData: {},
      error: false,
      activeTab: 'my-countries',
      userStorage: {
        countries: ['canada', 'usa']
      }
    };
  }

  // -------------------
  // Component Did Mount
  // -------------------

  componentDidMount() {
    this.updateData(this.initializeState);
  }

  // -------------------------
  // Populate all country data
  // -------------------------

  updateData = (cb) => {
    const fetchGlobalData = fetch('https://coronavirus-monitor.p.rapidapi.com/coronavirus/worldstat.php', {
      headers: headers
    }).then(response => response.json());
    const fetchCountryData = fetch('https://coronavirus-monitor.p.rapidapi.com/coronavirus/cases_by_country.php', {
      headers: headers
    }).then(response => response.json());
  
    const fetchData = Promise.all([fetchGlobalData, fetchCountryData]);
    fetchData.then(data => {
  
      // Normalizes our data to follow our own strcture
      this.updateWorldData(data[0]);
      this.updateCountryData(data[1]['countries_stat']);
      // this.createAltSpellingsObj();
  
      // Enable UI when fetching data complete
      this.setState({loading: false});
  
      // This will only trigger when both API requests return
      // We can now continue to modify the app
      cb();
    }).catch(error => {
      // Something went wrong with the API calls
      this.setState({error: true});
      console.log(error);
    });
  }

  // ----------------------
  // Normalize country data
  // ----------------------

  updateCountryData = (data) => {
    const newCountryData = {};

    data.forEach(item => {
      newCountryData[item.country_name.toLowerCase()] = {
        cases: Number(item.cases.split(',').join('')),
        deaths: Number(item.deaths.split(',').join('')),
        total_recovered: Number(item.total_recovered.split(',').join('')),
        new_cases: Number(item.new_cases.split(',').join('')),
        new_deaths: Number(item.new_deaths.split(',').join('')),
        title: item.country_name
      }
    });

    this.setState({countryData: newCountryData});
  }

  // --------------------
  // Normalize world data
  // --------------------

  updateWorldData = (data) => {
    const newWorldData = {
      cases: Number(data.total_cases.split(',').join('')),
      deaths: Number(data.total_deaths.split(',').join('')),
      new_cases: Number(data.new_cases.split(',').join('')),
      new_deaths: Number(data.new_deaths.split(',').join('')),
      total_recovered: Number(data.total_recovered.split(',').join('')),
      title: 'Global'
    };

    this.setState({worldData: newWorldData});
  }

  // --------------------------------------------------------
  // Acquire the top four countries to initiate the extension 
  // --------------------------------------------------------

  topFive = () => {
    const mostCasesArray = ['botswana', 'botswana', 'botswana', 'botswana'];
    for (let key in this.state.countryData) {  
      const leastCase = this.getSmallestValue(mostCasesArray);
      if (this.state.countryData[leastCase].cases < this.state.countryData[key].cases) {
        const indexOfLeastCase = mostCasesArray.indexOf(leastCase);
        mostCasesArray[indexOfLeastCase] = this.state.countryData[key].title.toLowerCase();
      }
    }

    return mostCasesArray;
  }

  // --------------------------------------------------------
  // HELPER: returns the smallest element of the passed array 
  // --------------------------------------------------------

  getSmallestValue = (countries) => {
    let smallest = countries[0];
    for (let countryName of countries) {
      if (this.state.countryData[smallest].cases > this.state.countryData[countryName].cases) smallest = countryName;
    }
    return smallest;
  }

  // ------------------------------------------------
  // Initialize country array based on local storage 
      // TESTING OF SYNC STORAGE
      // chrome.storage.sync.remove('userStorage');
  // ------------------------------------------------

  initializeState = () => {
    const sortedCountries = sortCountries(this.state.userStorage.countries, this.state.countryData);
    this.setState({userStorage: {countries: sortedCountries}});


    // If testing in react use the commented below and comment the rest of the code\

    // chrome.storage.sync.get('userStorage', function (result) {
    //   if (!result.userStorage) {
    //     userStorage.countries = topFive();
    //     chrome.storage.sync.set({ 'userStorage': userStorage });
    //     // console.log('User had no preferences saved.');
    //   }
    //   else {
    //     userStorage = result.userStorage;
    //     // console.log('User has preferences saved.');
    //   }
      
    //   rebuildTable();
    // });
  }

  // ----------------
  // Delete a Country
  // ----------------

  deleteCountry = (countryKey) => {
    for (let i=0; i < this.state.userStorage.countries.length; i++) {
      if (this.state.countryData[this.state.userStorage.countries[i]].title.toLowerCase() === countryKey) {
        this.state.userStorage.countries.splice(i, 1);
        // chrome.storage.sync.set({ 'userStorage': userStorage });
      }
    }
  }

  // -----------------------------------
  // Toggle between all and my countries
  // -----------------------------------

  toggleList = () => {
    if (this.state.activeTab === 'my-countries') {
      this.setState({activeTab: 'all-countries'});
    } else {
      this.setState({activeTab: 'my-countries'});
    }
  }

  render() {
    return (
      <div className="app">
        <div className="app__header">
          <CountryToggle state={this.state} toggleList={this.toggleList} />
        </div>
  
        <CountriesHeadings />
    
        <OverlayScrollbarsComponent className="os-theme-thick-light app__body">
          {this.errors &&
            <div className="app-errors">
              Data currently unavailable,<br />
              please check back later.
            </div>
          }

          {this.state.activeTab === 'my-countries' && !this.state.loading &&
            <div className="my-countries countries">
              {this.state.userStorage.countries.map(countryName => (
                <CountryRow key={countryName} countryData={this.state.countryData[countryName]} />
              ))}
            </div>   
          }
          
          {this.state.activeTab === 'all-countries' && !this.state.loading &&
            <div className="all-countries countries">
              {Object.values(this.state.countryData).map(countryData => (
                <CountryRow key={countryData.title} countryData={countryData} />
              ))}
            </div>
          }
        </OverlayScrollbarsComponent>
    
        <div className="app__footer">
          {this.state.activeTab === 'my-countries' &&
            <CountryForm />
          }
          <RefreshButton />
        </div>
  
      </div>
    );
  };
}

export default App;
