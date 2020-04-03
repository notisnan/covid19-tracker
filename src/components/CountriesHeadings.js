import React from 'react';
import './CountriesHeadings.css';

class CountriesHeadings extends React.Component {
  render() {
    return (
      <div className="header">
        <div className="header__item header__item--confirmed column-confirmed">Confirmed</div>
        <div className="header__item header__item--deaths column-deaths">Deaths</div>
        <div className="header__item header__item--recovered column-recovered">Recovered</div>
      </div>
    );
  }
}

export default CountriesHeadings;