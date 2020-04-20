/*global chrome*/

import React from 'react';
import './App.css';

// Custom Scrollbars: https://github.com/KingSora/OverlayScrollbars/tree/master/packages/overlayscrollbars-react
import './css/OverlayScrollbars.css';
import './css/os-theme-thick-light.css';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

// Components
import CountToggle from './components/CountToggle';
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
      },
      countType: 'million'
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
      
      if (this.state.countType === 'total') {
      // Sorting total count
        if (column === 'confirmed') { sortedArray.sort((a, b) => countries[b].cases - countries[a].cases );
        } else if (column === 'deaths') { sortedArray.sort((a, b) => countries[b].deaths - countries[a].deaths );
        } else if (column === 'tested') { sortedArray.sort((a, b) => countries[b].tested - countries[a].tested );
        } else if (column === 'recovered') { sortedArray.sort((a, b) => countries[b].total_recovered - countries[a].total_recovered );}
      } else {
      // Sorting per 1 million
        if (column === 'confirmed') { sortedArray.sort((a, b) => countries[b].cases_per_million - countries[a].cases_per_million );
        } else if (column === 'deaths') { sortedArray.sort((a, b) => countries[b].deaths_per_million - countries[a].deaths_per_million );
        } else if (column === 'tested') { sortedArray.sort((a, b) => countries[b].tests_per_million - countries[a].tests_per_million );
        } else if (column === 'recovered') { sortedArray.sort((a, b) => countries[b].recovered_per_million - countries[a].recovered_per_million );}
      }
      

    } else {
    // Low to high
      
      if (this.state.countType === 'total') {
      // Sorting total count
        if (column === 'confirmed') { sortedArray.sort((a, b) => countries[a].cases - countries[b].cases );
        } else if (column === 'deaths') { sortedArray.sort((a, b) => countries[a].deaths - countries[b].deaths );
        } else if (column === 'tested') { sortedArray.sort((a, b) => countries[a].tested - countries[b].tested );
        } else if (column === 'recovered') { sortedArray.sort((a, b) => countries[a].total_recovered - countries[b].total_recovered ); }
      } else {
      // Sorting per 1 million
        if (column === 'confirmed') { sortedArray.sort((a, b) => countries[a].cases_per_million - countries[b].cases_per_million );
        } else if (column === 'deaths') { sortedArray.sort((a, b) => countries[a].deaths_per_million - countries[b].deaths_per_million );
        } else if (column === 'tested') { sortedArray.sort((a, b) => countries[a].tests_per_million - countries[b].tests_per_million );
        } else if (column === 'recovered') { sortedArray.sort((a, b) => countries[a].recovered_per_million - countries[b].recovered_per_million ); }
      }

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
    let myTempCountries = ['canada', 'usa', 'global', 'faeroe islands', 'south sudan'];
    myTempCountries = this.sortData(myTempCountries, this.state.countryData, 'confirmed', true, true);
    this.setState({userStorage: {countries: myTempCountries}});

    // CHROME EXTENSION
    // If running as Chrome extension, use the code below
    // chrome.storage.sync.get('userStorage', (result) => {
    //   if (!result.userStorage) {
    //     const newUserStorage = {
    //       countries: getTopFourConfirmedCountries(this.state.countryData)
    //     };
    //     newUserStorage.countries = this.sortData(newUserStorage.countries, this.state.countryData, this.state.sort.column, true);

    //     this.setState({userStorage: newUserStorage});
    //     chrome.storage.sync.set({ 'userStorage': newUserStorage });
    //   }
    //   else {
    //     const newUserStorage = result.userStorage;

    //     // For V1 users that didn't have global in their country list
    //     // We manually patch global in for them
    //     if (!newUserStorage.countries.includes('global')) newUserStorage.countries.push('global');

    //     newUserStorage.countries = this.sortData(newUserStorage.countries, this.state.countryData, this.state.sort.column, true);
    //     this.setState({userStorage: newUserStorage});
    //   }
    // });
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
      // chrome.storage.sync.set({ 'userStorage': newUserStorage });
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
        // chrome.storage.sync.set({ 'userStorage': newUserStorage });
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

  // ------------------------------------------
  // Toggle total cases and cases per 1 million
  // ------------------------------------------

  toggleCount = () => {
    this.setState({ countType: (this.state.countType === 'total') ? 'million' : 'total' }, () => {
      const newUserStorage = JSON.parse(JSON.stringify(this.state.userStorage));
      newUserStorage.countries = this.sortData(this.state.userStorage.countries, this.state.countryData, this.state.sort.column, true);

      this.setState({ userStorage: newUserStorage });
    });
  }

  render() {
    return (
      <div className={`app ${this.state.refreshing ? 'app--refreshing' : ''}`} ref={this.appElement}>
        <div className="app__header">
          <div className="logo">
            <svg className="logo__svg" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 572.9 599.9" style={{ enableBackground: 'new 0 0 572.9 599.9' }} xmlSpace="preserve">
              <path d="M523.3,349.6c-11.8,0-22.7,4.1-31.2,11l-25.7-9.9c2.8-10.5,4.7-21.3,5.7-32.4c15.2-8.5,25.5-24.7,25.5-43.4 c0-23.6-16.5-43.4-38.6-48.4c-4.7-11.9-10.5-23.2-17.3-33.8l19.2-19.2c4.1,1.1,8.4,1.7,12.9,1.7c27.4,0,49.6-22.2,49.6-49.6 S501,76,473.6,76S424,98.2,424,125.7c0,4.5,0.6,8.8,1.7,12.9l-16,16c-30-28.1-68.6-47-111.4-52.3v-9.5c14.9-8.6,24.9-24.6,24.9-43 C323.2,22.2,301,0,273.6,0s-49.6,22.2-49.6,49.6c0,18.4,10,34.4,24.8,43v9.6c-45,5.6-85.4,26.3-115.9,56.8l-34.2-25.4 c0.4-2.6,0.6-5.2,0.6-7.9C99.3,98.2,77.1,76,49.6,76S0,98.2,0,125.7s22.2,49.6,49.6,49.6c6.2,0,12.2-1.2,17.7-3.2l35,26.1 C84.5,227.9,74.3,262.8,74.3,300c0,2.2,0,4.4,0.1,6.6c-7.3-4.2-15.7-6.6-24.8-6.6C22.2,299.9,0,322.2,0,349.6s22.2,49.6,49.6,49.6 c16.8,0,31.6-8.3,40.6-21.1c6.9,16.1,15.8,31.1,26.5,44.7l-29.9,29.9c-4.1-1.1-8.4-1.7-12.9-1.7c-27.4,0-49.6,22.2-49.6,49.6 s22.2,49.6,49.6,49.6s49.6-22.2,49.6-49.6c0-4.5-0.6-8.8-1.7-12.9l30-30c18.3,14.1,39,25.1,61.5,32.3c-8.9,9-14.4,21.3-14.4,34.9 c0,27.4,22.2,49.6,49.6,49.6s49.6-22.2,49.6-49.6c0-9.7-2.8-18.7-7.6-26.4c20.8-1.8,40.6-6.8,59.1-14.4l29.5,44.5 c-3.2,6.6-5,13.9-5,21.7c0,27.4,22.2,49.6,49.6,49.6s49.6-22.2,49.6-49.6s-22.2-49.6-49.6-49.6c-1.2,0-2.4,0.1-3.6,0.1L393,459.5 c22.4-16.8,41.1-38.2,54.8-62.8l26.4,10.2c3.7,23.8,24.2,42,49,42c27.4,0,49.6-22.2,49.6-49.6C572.9,371.8,550.7,349.6,523.3,349.6z M273.6,449.3c-82.3,0-149.3-67-149.3-149.3s67-149.3,149.3-149.3s149.3,67,149.3,149.3S355.9,449.3,273.6,449.3z"/>
            </svg>
          </div>
          <CountToggle countType={this.countType} toggleCount={this.toggleCount} state={this.state} />
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
