import React from 'react';
import './RefreshButton.css';

class RefreshButton extends React.Component {
  render() {
    return (
      <button className="button-refresh" onClick={() => this.props.refreshData(this.refreshSvgElement)}>
        <svg className="button-refresh__svg" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 16 16" style={{enableBackground: 'new 0 0 16 16'}} xmlSpace="preserve">
          <path d="M13.6,2.3C12.2,0.9,10.2,0,8,0C3.6,0,0,3.6,0,8s3.6,8,8,8c3.7,0,6.8-2.5,7.7-6h-2.1c-0.8,2.3-3,4-5.6,4c-3.3,0-6-2.7-6-6 s2.7-6,6-6c1.7,0,3.1,0.7,4.2,1.8L9,7h7V0L13.6,2.3z"/>
        </svg>
      </button>
    );
  }
}

export default RefreshButton;