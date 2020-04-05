import React from 'react';
import './App.css';

// Transition group: https://reactcommunity.org/react-transition-group/
import { CSSTransition, TransitionGroup } from 'react-transition-group';

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
import sortCountries from './helpers/sortCountries';
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
      worldData: {},
      countryData: {},
      countryList: [],
      error: false,
      activeTab: 'my-countries',
      userStorage: {
        countries: ['canada', 'usa']
      },
      inputError: false,
      inputErrorMessage: ''
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
      const newWorldData = api1ConvertWorldData(data[0]);
      const newCountryData = api1ConvertCountryData(data[1]['countries_stat']);
      const newCountryList = sortCountries(Object.keys(newCountryData), newCountryData);

      this.setState({
        worldData: newWorldData,
        countryData: newCountryData,
        countryList: newCountryList
      });

      // this.createAltSpellingsObj();
  
      // Enable UI when fetching data complete
      if (this.state.loading) this.setState({loading: false});
  
      // This will only trigger when both API requests return
      // We can now continue to modify the app
      if (cb) cb();
    }).catch(error => {
      // Something went wrong with the API calls
      this.setState({error: true});
      console.log('ERROR: ', error);
    });
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
    //     const newUserStorage = JSON.parse(JSON.stringify(this.state.userStorage));
    //     newUserStorage.countries = getTopFourConfirmedCountries(this.state.countryData);
    //     this.setState({userStorage: newUserStorage});
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

  // ------------
  // Refresh data
  // ------------

  // const app = document.querySelector('.app');
  // const refreshButton = document.querySelector('.button-refresh');
  // const refreshButtonSvg = document.querySelector('.button-refresh__svg');
  // let refreshIconRotation = 0;

  // refreshButton.addEventListener('click', refreshUI);
  // refreshButtonSvg.addEventListener('transitionend', continueSpinning);

  // function refreshUI() {
  //   app.classList.add('app--refreshing');

  //   // Start the rotate button spinning
  //   // When the data comes back, make sure the last spin gets to finish
  //   refreshIconRotation += 360;
  //   refreshButtonSvg.style.transform = `rotate(${refreshIconRotation}deg)`;

  //   updateData(initializeState);
  // }

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

  // -------------------
  // On component update
  // -------------------

  // componentDidUpdate() {
  //   console.log('component did update');
  // }
  
  // ----------------
  // Add a Country
  // ----------------

  addCountry = (countryElement) => {
    // check if country vaue is valid
    const inputValue = countryElement.value.toLowerCase();

    if (this.state.countryData.hasOwnProperty(inputValue)) {
      if (this.state.userStorage.countries.includes(inputValue)) {
        this.setState({inputError: true, inputErrorMessage: 'Country is already in your list'}, hideErrorMessage);
        return;
      }

      const newUserStorage = JSON.parse(JSON.stringify(this.state.userStorage));
      newUserStorage.countries.push(inputValue);
      newUserStorage.countries = sortCountries(newUserStorage.countries, this.state.countryData);
      this.setState({userStorage: newUserStorage});
      countryElement.value = "";
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
      <div className={`app ${this.state.refreshing ? 'app--refreshing' : ''}`}>
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
            <div className={`my-countries countries ${this.state.refershing ? 'countries--disabled' : ''}`}>

              <CountryRow key="global" placeData={this.state.worldData} />

              <TransitionGroup component={null}>
                {this.state.userStorage.countries.map(countryName => (
                  <CSSTransition
                    key={countryName}
                    timeout={{enter: 1000, exit: 0}}
                    classNames="country-"
                  >
                    <CountryRow 
                      placeData={this.state.countryData[countryName]}
                      deleteCountry={this.deleteCountry}
                    />
                  </CSSTransition>
                ))}
              </TransitionGroup>
            </div>   
          }
          
          {this.state.activeTab === 'all-countries' &&
           !this.state.loading &&
           !this.state.error &&
           <div className={`all-countries countries ${this.state.refershing ? 'countries--disabled' : ''}`}>

              <CountryRow key="global" placeData={this.state.worldData} />

              {this.state.countryList.map(countryName => (
                <CountryRow
                  key={countryName}
                  placeData={this.state.countryData[countryName]}
                />
              ))}
            </div>
          }
        </OverlayScrollbarsComponent>
    
        <div className="app__footer">
          {this.state.activeTab === 'my-countries' &&
           !this.state.error &&
            <CountryForm state={this.state} addCountry={this.addCountry}/>
          }
          <RefreshButton refreshData={this.refreshData} state={this.state} />
        </div>
  
      </div>
    );
  };
}

export default App;
