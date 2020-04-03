import React from 'react';
import './CountryForm.css';

class CountryForm extends React.Component {
  constructor(props) {
    super(props);
    this.countryInputElement = React.createRef();
  }

  onCountryAdd = () => {
    this.props.addCountry(this.countryInputElement.current);
  }

  render() {
    return (
      <form className="country-form" onSubmit={(e) => e.preventDefault()}>
        <div className="country-form__error">Country is already in your list</div>
        <input type="text" placeholder="Country Name" className="country-form__input" ref={this.countryInputElement}/>
        <button className="country-form__button" onClick={this.onCountryAdd}>Add</button>
      </form>
    );
  }
}

export default CountryForm;