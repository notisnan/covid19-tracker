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
import {api1ConvertWorldData, api1ConvertCountryData} from './helpers/api1ConvertData';

// Images
import loader from './images/loader.gif';

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
  
      // Convert API data into a normazlied format
      this.setState({worldData: api1ConvertWorldData(data[0])});
      this.setState({countryData: api1ConvertCountryData(data[1]['countries_stat'])});

      // this.createAltSpellingsObj();
  
      // Enable UI when fetching data complete
      this.setState({loading: false});
  
      // This will only trigger when both API requests return
      // We can now continue to modify the app
      cb();
    }).catch(error => {
      // Something went wrong with the API calls
      this.setState({error: true});
      console.log('ERROR: ', error);
    });
  }

  // -------------------------------------------------------------------------------------
  // If user had no preferences, populate my countries list with top 4 confirmed countries
  // -------------------------------------------------------------------------------------

  populateDefaultCountries = () => {
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
    //     userStorage.countries = populateDefaultCountries();
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
  // Add a Country
  // ----------------

  addCountry = (countryElement) => {
    // check if country vaue is valid
    const inputValue = countryElement.value.toLowerCase();

    if (this.state.countryData.hasOwnProperty(inputValue)) {
      if (this.state.userStorage.countries.includes(inputValue)) {
        //TODO: Error pop-up: You already have that country 
        return;
      }
      const newUserStorage = JSON.parse(JSON.stringify(this.state.userStorage));
      newUserStorage.countries.push(inputValue);
      this.setState({userStorage: newUserStorage});
      countryElement.value = "";
    }
  } 

  // ----------------
  // Delete a Country
  // ----------------

  deleteCountry = (countryKey) => {
    console.log(countryKey);
    for (let i=0; i < this.state.userStorage.countries.length; i++) {
      if (this.state.countryData[this.state.userStorage.countries[i]].title.toLowerCase() === countryKey) {
        const newUserStorage = JSON.parse(JSON.stringify(this.state.userStorage));
        newUserStorage.countries.splice(i, 1);
        this.setState({userStorage: newUserStorage});
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
    
        <OverlayScrollbarsComponent options={{ sizeAutoCapable: true }} className="os-theme-thick-light app__body">
          {this.state.loading &&
            <div className="app-message">
              <img src={loader} alt=""/>
            </div>
          }
          
          {this.state.error &&
            <div className="app-message app-message--errors">
              Data currently unavailable,<br />
              please check back later.
            </div>
          }

          {this.state.activeTab === 'my-countries' &&
           !this.state.loading &&
           !this.state.error &&
            <div className="my-countries countries">
              {this.state.userStorage.countries.map(countryName => (
                <CountryRow 
                  key={countryName} 
                  countryData={this.state.countryData[countryName]} 
                  deleteCountry={this.deleteCountry}
                />
              ))}
            </div>   
          }
          
          {this.state.activeTab === 'all-countries' &&
           !this.state.loading &&
           !this.state.error &&
            <div className="all-countries countries">
              {Object.values(this.state.countryData).map(countryData => (
                <CountryRow key={countryData.title} countryData={countryData} />
              ))}
            </div>
          }
        </OverlayScrollbarsComponent>
    
        <div className="app__footer">
          {this.state.activeTab === 'my-countries' &&
           !this.state.error &&
            <CountryForm addCountry={this.addCountry}/>
          }
          <RefreshButton />
        </div>
  
      </div>
    );
  };
}

export default App;
