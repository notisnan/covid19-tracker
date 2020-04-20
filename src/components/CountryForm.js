import React from 'react';
import './CountryForm.css';

// Transition group: https://reactcommunity.org/react-transition-group/
import { CSSTransition } from 'react-transition-group';

class CountryForm extends React.Component {
  constructor(props) {
    super(props);
    this.countryInputElement = React.createRef();
  }

  onCountryAdd = () => {
    const element = this.countryInputElement.current;

    this.props.addCountry(element, element.value.toLowerCase().trim());
  }

  render() {
    return (
      <form className={`country-form ${this.props.state.refreshing ? 'country-form--diabled' : ''}`} onSubmit={(e) => e.preventDefault()}>
        <CSSTransition
          in={this.props.state.inputError}
          timeout={200}
          classNames="country-form__error-"
        >
          <div className="country-form__error">{this.props.state.inputErrorMessage}</div>
        </CSSTransition>
        <input type="text" placeholder="Country Name" className="country-form__input" ref={this.countryInputElement}/>
        <button className="country-form__button" onClick={this.onCountryAdd}>Add</button>
      </form>
    );
  }
}

export default CountryForm;