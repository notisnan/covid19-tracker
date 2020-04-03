import React from 'react';
import './CountryForm.css';

class CountryForm extends React.Component {
  render() {
    return (
      <form className="country-form" onSubmit={(e) => e.preventDefault()}>
        <div className="country-form__error">Country is already in your list</div>
        <input type="text" placeholder="Country Name" className="country-form__input" />
        <button className="country-form__button">Add</button>
      </form>
    );
  }
}

export default CountryForm;