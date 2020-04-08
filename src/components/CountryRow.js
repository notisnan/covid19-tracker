import React from 'react';
import './CountryRow.css';
import concatNumber from '../helpers/concatNumber.js';
import calculatePercentage from '../helpers/calculatePercentage.js';

// Transition group: https://reactcommunity.org/react-transition-group/
import { CSSTransition, TransitionGroup } from 'react-transition-group';

class CountryRow extends React.Component {
  deleteCountry = () => {
    this.props.deleteCountry(this.props.placeData.title.toLowerCase());
  }

  addCountry = () => {
    this.props.addCountry(null, this.props.placeData.title.toLowerCase());
  }

  render() {
    const country = this.props.placeData;

    return (
      <div className={`
      ${(this.props.state.userStorage.countries.includes(country.title.toLowerCase())) ? 'country--active' : '' }
      ${(country.title === 'Global') ? 'country--global' : ''}
      country`}>
        {country.title !== 'Global' &&
          <button className="remove-country" onClick={this.deleteCountry}>
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 14 14" style={{enableBackground: 'new 0 0 14 14'}} xmlSpace="preserve">
              <path d="M14,1.4L12.6,0L7,5.6L1.4,0L0,1.4L5.6,7L0,12.6L1.4,14L7,8.4l5.6,5.6l1.4-1.4L8.4,7L14,1.4z"></path>
            </svg>
          </button>
        }

        <TransitionGroup component={null}>
        {!this.props.state.userStorage.countries.includes(country.title.toLowerCase()) &&
         country.title !== 'Global' &&
          <CSSTransition timeout={800} classNames="add-country-">
            <button className="add-country" onClick={this.addCountry}>
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 14 14" style={{enableBackground: 'new 0 0 14 14'}} xmlSpace="preserve">
                <path d="M14,1.4L12.6,0L7,5.6L1.4,0L0,1.4L5.6,7L0,12.6L1.4,14L7,8.4l5.6,5.6l1.4-1.4L8.4,7L14,1.4z"></path>
              </svg>
            </button>
          </CSSTransition>
        }
        </TransitionGroup>

        <div className="country__name">{country.title}</div>

        <div className="statistic column-confirmed">
          <div className="statistic__count" dangerouslySetInnerHTML={{__html: concatNumber(country.cases)}}></div>
          <div className="statistic__change" dangerouslySetInnerHTML={{__html: calculatePercentage(country.new_cases, country.cases)}}></div>
        </div>

        <div className="statistic column-deaths">
          <div className="statistic__count" dangerouslySetInnerHTML={{__html: concatNumber(country.deaths)}}></div>
          <div className="statistic__change" dangerouslySetInnerHTML={{__html: calculatePercentage(country.new_deaths, country.deaths)}}></div>
        </div>

        <div className="statistic column-recovered">
          <div className="statistic__count" dangerouslySetInnerHTML={{__html: concatNumber(country.total_recovered)}}></div>
          <div className="statistic__change"></div>
        </div>
      </div>
    );
  }
}

export default CountryRow;