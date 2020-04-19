/*global chrome*/

import React from 'react';
import './App.css';

// Custom Scrollbars: https://github.com/KingSora/OverlayScrollbars/tree/master/packages/overlayscrollbars-react
import './css/OverlayScrollbars.css';
import './css/os-theme-thick-light.css';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

// Components
import CountryToggle from './components/CountryToggle';
import CountriesHeadings from './components/CountriesHeadings';
import CountryForm from './components/CountryForm';
import RefreshButton from './components/RefreshButton';
import CountryRow from './components/CountryRow';
import headers from './headers';

// Helper Functions
import { api1ConvertWorldData, api1ConvertCountryData } from './helpers/api1ConvertData';
import getTopFourConfirmedCountries from './helpers/getTopFourConfirmedCountries';

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
      refreshing: false,
      countryData: {},
      alternateSpellings: {},
      countryList: [],
      error: false,
      activeTab: 'my-countries',
      userStorage: {
        countries: []
      },
      inputError: false,
      inputErrorMessage: '',
      sort: {
        column: '',
        highLow: true
      }
    };
  }

  // -------------------
  // Component Did Mount
  // -------------------

  componentDidMount() {
    this.updateData(this.initializeState);
  }

  // ---------
  // Sort data
  // ---------

  sortData = (array, countries, column, flipData, highLow = this.state.sort.highLow) => {
    const sortedArray = JSON.parse(JSON.stringify(array));

    if (!flipData) {
      if (column === this.state.sort.column) highLow = !this.state.sort.highLow;
    }
    
    if (highLow) {
      
      // High to low
      if (column === 'confirmed') { sortedArray.sort((a, b) => countries[b].cases - countries[a].cases );
      } else if (column === 'deaths') { sortedArray.sort((a, b) => countries[b].deaths - countries[a].deaths );
      } else if (column === 'tested') { sortedArray.sort((a, b) => countries[b].tested - countries[a].tested );
      } else if (column === 'recovered') { sortedArray.sort((a, b) => countries[b].total_recovered - countries[a].total_recovered );}

    } else {

      // Low to high
      if (column === 'confirmed') { sortedArray.sort((a, b) => countries[a].cases - countries[b].cases );
      } else if (column === 'deaths') { sortedArray.sort((a, b) => countries[a].deaths - countries[b].deaths );
      } else if (column === 'tested') { sortedArray.sort((a, b) => countries[a].tested - countries[b].tested );
      } else if (column === 'recovered') { sortedArray.sort((a, b) => countries[a].total_recovered - countries[b].total_recovered ); }

    }

    this.setState({
      sort: {
        column: column,
        highLow: highLow
      }
    });

    return sortedArray;
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
      const newCountryData = api1ConvertCountryData(data[1]['countries_stat']);
      newCountryData['global'] = api1ConvertWorldData(data[0]);
      const newCountryList = this.sortData(Object.keys(newCountryData), newCountryData, this.state.sort.column || 'confirmed', true);      
      
      const newAlternateSpellings = {
        'us': newCountryData['usa'],
        'united states': newCountryData['usa'],
        'united states of america': newCountryData['usa'],
        'democratic republic of congo': newCountryData['drc'],
        'south korea': newCountryData['s. korea']
      };

      this.setState({
        countryData: newCountryData,
        countryList: newCountryList,
        alternateSpellings: newAlternateSpellings
      }, () => {        
        
        // Enable UI when fetching data complete
        if (this.state.loading) {
          this.setState({
            loading: false,
            error: false,
            refreshing: false
          });
        }

        // This will only trigger when both API requests return
        // We can now continue to modify the app
        if (cb) cb();
      });
    }).catch(error => {
      // Something went wrong with the API calls
      this.setState({
        error: true,
        loading: false
      });

      setTimeout(() => {
        this.setState({refreshing: false});
      }, 1000);

      console.log('ERROR: ', error);
    });
  }

  // ------------------------------------------------
  // Initialize country array based on local storage 
  // ------------------------------------------------

  initializeState = () => {
    // TESTING OF SYNC STORAGE
    // chrome.storage.sync.remove('userStorage');

    // REACT
    // If running in react use the code below and comment out all instances of chrome storage
    // let myTempCountries = ['canada', 'usa', 'global'];
    // myTempCountries = this.sortData(myTempCountries, this.state.countryData, 'confirmed', true, true);
    // this.setState({userStorage: {countries: myTempCountries}});

    // CHROME EXTENSION
    // If running as Chrome extension, use the code below
    chrome.storage.sync.get('userStorage', (result) => {
      if (!result.userStorage) {
        const newUserStorage = {
          countries: getTopFourConfirmedCountries(this.state.countryData)
        };
        newUserStorage.countries = this.sortData(newUserStorage.countries, this.state.countryData, this.state.sort.column, true);

        this.setState({userStorage: newUserStorage});
        chrome.storage.sync.set({ 'userStorage': newUserStorage });
      }
      else {
        const newUserStorage = result.userStorage;

        // For V1 users that didn't have global in their country list
        // We manually patch global in for them
        if (!newUserStorage.countries.includes('global')) newUserStorage.countries.push('global');

        newUserStorage.countries = this.sortData(newUserStorage.countries, this.state.countryData, this.state.sort.column, true);
        this.setState({userStorage: newUserStorage});
      }
    });
  }

  // -----------------------
  // Should component update
  // -----------------------

  shouldComponentUpdate = (nextProps, nextState) => {
    if (!nextState.userStorage.countries.length) {
      return false;
    }

    return true;
  }

  // ------------
  // Refresh data
  // ------------

  refreshData = (svg) => {
    if (this.state.refreshing) return;

    this.setState({refreshing: true}, () => {
      this.updateData(() => {
        setTimeout(() => {
          this.setState({refreshing: false});
        }, 1000);
      });
    });
  }
  
  // ----------------
  // Add a Country
  // ----------------

  addCountry = (countryElement, value) => {

    // check to see if this is an alternate spelling
    if (this.state.alternateSpellings.hasOwnProperty(value)) {
      value = this.state.alternateSpellings[value].title.toLowerCase();
    }

    // check if country exists in countryData or alternateSpellings
    if (this.state.countryData.hasOwnProperty(value)) {
      if (this.state.userStorage.countries.includes(value)) {
        this.setState({inputError: true, inputErrorMessage: 'Country is already in your list'}, hideErrorMessage);
        return;
      }

      const newUserStorage = JSON.parse(JSON.stringify(this.state.userStorage));
      newUserStorage.countries.push(value);
      newUserStorage.countries = this.sortData(newUserStorage.countries, this.state.countryData, this.state.sort.column, true);

      this.setState({userStorage: newUserStorage});
      chrome.storage.sync.set({ 'userStorage': newUserStorage });
      if (countryElement) countryElement.value = "";
    } else {
      // Country doesn't exist in our global countries list
      this.setState({inputError: true, inputErrorMessage: 'Invalid country name'}, hideErrorMessage);
    }

    function hideErrorMessage() {
      setTimeout(() => {
        this.setState({inputError: false});
      }, 1000);
    }
  } 

  // ----------------
  // Delete a Country
  // ----------------

  deleteCountry = (countryKey) => {
    for (let i=0; i < this.state.userStorage.countries.length; i++) {
      if (this.state.countryData[this.state.userStorage.countries[i]].title.toLowerCase() === countryKey) {
        const newUserStorage = JSON.parse(JSON.stringify(this.state.userStorage));
        newUserStorage.countries.splice(i, 1);
        this.setState({userStorage: newUserStorage});
        chrome.storage.sync.set({ 'userStorage': newUserStorage });
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
      <div className={`app ${this.state.refreshing ? 'app--refreshing' : ''}`} ref={this.appElement}>
        <div className="app__header">
          <CountryToggle app={this} toggleList={this.toggleList} state={this.state} />
        </div>
  
        <CountriesHeadings sortData={this.sortData} state={this.state} app={this} />
    
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
            <div className={`my-countries countries ${this.state.refershing ? 'countries--disabled' : ''}`}>
              {this.state.userStorage.countries.map(countryName => (
                <CountryRow 
                  key={countryName}
                  state={this.state}
                  placeData={this.state.countryData[countryName]}
                  deleteCountry={this.deleteCountry}
                />
              ))}
            </div>   
          }
          
          {this.state.activeTab === 'all-countries' &&
           !this.state.loading &&
           !this.state.error &&
           <div className={`all-countries countries ${this.state.refershing ? 'countries--disabled' : ''}`}>
              {this.state.countryList.map(countryName => (
                <CountryRow
                  key={countryName}
                  app={this}
                  state={this.state}
                  placeData={this.state.countryData[countryName]}
                  addCountry={this.addCountry}
                />
              ))}
            </div>
          }
        </OverlayScrollbarsComponent>
    
        <div className="app__footer">
          {this.state.activeTab === 'my-countries' &&
          !this.state.loading &&
          !this.state.error &&
            <CountryForm state={this.state} addCountry={this.addCountry}/>
          }
          {!this.state.loading &&
            <RefreshButton refreshData={this.refreshData} state={this.state} />
          }
        </div>

      </div>
    );
  };
}

export default App;
