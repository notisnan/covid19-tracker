import React from 'react';
import './CountryToggle.css';

class CountryToggle extends React.Component {
  render() {
    return (
      <div className={this.props.app.state.activeTab === 'my-countries' ? 'country-toggle' : 'country-toggle country-toggle--all'} onClick={this.props.toggleList}>
        <button className={`${this.props.app.state.activeTab === 'my-countries' ? 'country-toggle__item--active' : '' } country-toggle__item`}>My Countries</button>
        <button className={this.props.app.state.activeTab === 'all-countries' ? "country-toggle__item country-toggle__item--active" : "country-toggle__item"}>All Countries</button>
      </div>
    );
  }
}

export default CountryToggle;