import React from 'react';
import './CountToggle.css';

class CountryToggle extends React.Component {
  render() {
    return (
      <div
      className={`
        count-toggle-wrapper
        ${(this.props.state.countType === 'total') ? 'count-toggle-wrapper--total' : 'count-toggle-wrapper--million'}
      `}
      onClick={this.props.toggleCount}>
        <div className="count-toggle">
          <div className="count-toggle__indicator"></div>
        </div>
        <div className="count-labels">
          <div className={`${(this.props.state.countType === 'total') ? 'count-labels__item--active' : ''} count-labels__item`}>Count Total</div>
          <div className={`${(this.props.state.countType === 'million') ? 'count-labels__item--active' : ''} count-labels__item`}>Count Per 1m People</div>
        </div>
      </div>
    );
  }
}

export default CountryToggle;