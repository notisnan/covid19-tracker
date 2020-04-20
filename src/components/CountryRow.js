import React from 'react';
import './CountryRow.css';
import concatNumber from '../helpers/concatNumber.js';

// Transition group: https://reactcommunity.org/react-transition-group/
import { CSSTransition, TransitionGroup } from 'react-transition-group';

class CountryRow extends React.Component {
  
  // --------------
  // Delete Country
  // --------------
  
  deleteCountry = () => {
    this.props.deleteCountry(this.props.placeData.title.toLowerCase());
  }

  // -----------
  // Add Country
  // -----------

  addCountry = () => {
    this.props.addCountry(null, this.props.placeData.title.toLowerCase());
  }

  // ----------------------------------------------
  // Caclulate and format deaths change per million
  // ----------------------------------------------

  confirmedPerMillion = (countryStats) => {
    let confirmedPerMillion = Number(countryStats.new_cases / (countryStats.population/1000000));

    if (isNaN(confirmedPerMillion)) {
      confirmedPerMillion = 'N/A';
    } else if (!confirmedPerMillion) {
      confirmedPerMillion = 0;
    } else if (confirmedPerMillion < 1) {
      confirmedPerMillion = '<1';
    } else {
      confirmedPerMillion = `+${parseInt(confirmedPerMillion)}`;
    }

    return confirmedPerMillion;
  }

  // ----------------------------------------------
  // Caclulate and format deaths change per million
  // ----------------------------------------------

  deathsPerMillion = (countryStats) => {
    let deathsPerMillion = Number(countryStats.new_deaths / (countryStats.population/1000000));

    if (isNaN(deathsPerMillion)) {
      deathsPerMillion = 'N/A';
    } else if (!deathsPerMillion) {
      deathsPerMillion = 0;
    } else if (deathsPerMillion < 1) {
      deathsPerMillion = '<1';
    } else {
      deathsPerMillion = `+${parseInt(deathsPerMillion)}`;
    }

    return deathsPerMillion;
  }

  render() {
    const country = this.props.placeData;

    // ------
    // Return
    // ------

    return (
      <div className={`
      ${(this.props.state.userStorage.countries.includes(country.title.toLowerCase())) ? 'country--active' : '' }
      ${(country.title === 'Global') ? 'country--global' : ''}
      country`}>

        {/* --------------------- */}
        {/* Remove country button */}
        {/* --------------------- */}

        {country.title !== 'Global' &&
          <button className="remove-country" onClick={this.deleteCountry}>
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 14 14" style={{enableBackground: 'new 0 0 14 14'}} xmlSpace="preserve">
              <path d="M14,1.4L12.6,0L7,5.6L1.4,0L0,1.4L5.6,7L0,12.6L1.4,14L7,8.4l5.6,5.6l1.4-1.4L8.4,7L14,1.4z"></path>
            </svg>
          </button>
        }

        {/* ------------------ */}
        {/* Add country button */}
        {/* ------------------ */}

        <TransitionGroup component={null}>
        {!this.props.state.userStorage.countries.includes(country.title.toLowerCase()) &&
         country.title !== 'Global' &&
          <CSSTransition timeout={500} classNames="add-country-">
            <button className="add-country" onClick={this.addCountry}>
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 14 14" style={{enableBackground: 'new 0 0 14 14'}} xmlSpace="preserve">
                <path d="M14,1.4L12.6,0L7,5.6L1.4,0L0,1.4L5.6,7L0,12.6L1.4,14L7,8.4l5.6,5.6l1.4-1.4L8.4,7L14,1.4z"></path>
              </svg>
            </button>
          </CSSTransition>
        }
        </TransitionGroup>

        {/* -------------------------- */}
        {/* Country Title + Population */}
        {/* -------------------------- */}

        <div className="column column-country">
          <div className={`
            column__info-top
            ${(country.title.length > 16) ? 'column__info-top--small' : ''}
          `}>{country.title}</div>
          <div className="column__info-bottom" dangerouslySetInnerHTML={{__html: `pop ${concatNumber(country.population)}`}}></div>
        </div>

        {/* ---------------------- */}
        {/* Confirmed Cases Column */}
        {/* ---------------------- */}

        <div className="column column-confirmed">
          <div className="column__info-top" dangerouslySetInnerHTML={{__html:
            (this.props.state.countType === 'total') ?
              concatNumber(country.cases) :
              (concatNumber(country.cases_per_million) < 1) ? '<1' : concatNumber(country.cases_per_million)
            }}>
          </div>
          <div className="column__info-bottom">{`
            ${
              (this.props.state.countType === 'total') ?
                '+' + country.new_cases.toLocaleString('en-US') :
                this.confirmedPerMillion(country) || 0
            }
          `}</div>
        </div>

        {/* ------------- */}
        {/* Deaths Column */}
        {/* ------------- */}

        <div className="column column-deaths">
          <div className="column__info-top" dangerouslySetInnerHTML={{__html:
            (this.props.state.countType === 'total') ?
              concatNumber(country.deaths) :
              (concatNumber(country.deaths_per_million) < 1) ?
                (country.deaths_per_million === 0) ? '0' : '<1' :
                concatNumber(country.deaths_per_million)
            }}>
          </div>
          <div className="column__info-bottom">
            {`${
              (this.props.state.countType === 'total') ?
                '+' + country.new_deaths.toLocaleString('en-US') :
                this.deathsPerMillion(country) || 0
            }`}
          </div>
        </div>

        {/* ------------- */}
        {/* Tested Column */}
        {/* ------------- */}

        <div className="column column-tested">
          <div className="column__info-top" dangerouslySetInnerHTML={{__html:
            (this.props.state.countType === 'total') ?
              concatNumber(country.tested || NaN) :
              concatNumber(country.tests_per_million || NaN)
          }}></div>
          <div className="column__info-bottom"></div>
        </div>

        {/* ---------------- */}
        {/* Recovered Column */}
        {/* ---------------- */}

        <div className="column column-recovered">
          <div className="column__info-top" dangerouslySetInnerHTML={{__html:
            (this.props.state.countType === 'total') ?
              concatNumber(country.total_recovered) :
              concatNumber(country.recovered_per_million)
          }}></div>
          <div className="column__info-bottom"></div>
        </div>

      </div>
    );
  }
}

export default CountryRow;