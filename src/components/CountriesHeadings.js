import React from 'react';
import './CountriesHeadings.css';

class CountriesHeadings extends React.Component {  
  render() {
    return (
      <div className="header">
        <div
        className={`
          ${this.props.state.sort.column === 'confirmed' ? 'header__item--active' : ''}
          ${this.props.state.sort.highLow ? 'header__item--high-low' : 'header__item--low-high'}
          header__item header__item--confirmed column-confirmed`}
        onClick={() => this.props.headerClick('confirmed')}
        ><span>Confirmed</span></div>
        
        <div
        className={`
          ${this.props.state.sort.column === 'deaths' ? 'header__item--active' : ''}
          ${this.props.state.sort.highLow ? 'header__item--high-low' : 'header__item--low-high'}
          header__item header__item--deaths column-deaths`}
        onClick={() => this.props.headerClick('deaths')}
        ><span>Deaths</span></div>

        <div
        className={`
          ${this.props.state.sort.column === 'tested' ? 'header__item--active' : ''}
          ${this.props.state.sort.highLow ? 'header__item--high-low' : 'header__item--low-high'}
          header__item header__item--tested column-tested`}
        onClick={() => this.props.headerClick('tested')}
        ><span>Tested</span></div>

        <div
        className={`
          ${this.props.state.sort.column === 'recovered' ? 'header__item--active' : ''}
          ${this.props.state.sort.highLow ? 'header__item--high-low' : 'header__item--low-high'}
          header__item header__item--recovered column-recovered`}
        onClick={() => this.props.headerClick('recovered')}
        ><span>Recovered</span></div>

      </div>
    );
  }
}

export default CountriesHeadings;