import React from 'react';
import './CountriesHeadings.css';

class CountriesHeadings extends React.Component {
  sortColumn = (column) => {
    const newUserStorage = JSON.parse(JSON.stringify(this.props.state.userStorage));
    newUserStorage.countries = this.props.sortData(this.props.state.userStorage.countries, this.props.state.countryData, column);

    let newCountryList = JSON.parse(JSON.stringify(this.props.state.countryList));
    newCountryList = this.props.sortData(this.props.state.countryList, this.props.state.countryData, column);

    this.props.app.setState({
      userStorage: newUserStorage,
      countryList: newCountryList
    });
  }
  
  render() {
    return (
      <div className="header">
        <div
        className={`
          ${this.props.state.sort.column === 'confirmed' ? 'header__item--active' : ''}
          ${this.props.state.sort.highLow ? 'header__item--high-low' : 'header__item--low-high'}
          header__item header__item--confirmed column-confirmed`}
        onClick={() => this.sortColumn('confirmed')}
        ><span>Confirmed</span></div>
        
        <div
        className={`
          ${this.props.state.sort.column === 'deaths' ? 'header__item--active' : ''}
          ${this.props.state.sort.highLow ? 'header__item--high-low' : 'header__item--low-high'}
          header__item header__item--deaths column-deaths`}
        onClick={() => this.sortColumn('deaths')}
        ><span>Deaths</span></div>

        <div
        className={`
          ${this.props.state.sort.column === 'tested' ? 'header__item--active' : ''}
          ${this.props.state.sort.highLow ? 'header__item--high-low' : 'header__item--low-high'}
          header__item header__item--tested column-tested`}
        onClick={() => this.sortColumn('tested')}
        ><span>Tested</span></div>

        <div
        className={`
          ${this.props.state.sort.column === 'recovered' ? 'header__item--active' : ''}
          ${this.props.state.sort.highLow ? 'header__item--high-low' : 'header__item--low-high'}
          header__item header__item--recovered column-recovered`}
        onClick={() => this.sortColumn('recovered')}
        ><span>Recovered</span></div>

      </div>
    );
  }
}

export default CountriesHeadings;