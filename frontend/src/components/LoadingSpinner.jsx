import React from 'react';

const LoadingSpinner = ({ text = 'Loading applications...' }) => {
  return (
    <div className="loading-container">
      <div className="spinner-ring"></div>
      <p className="loading-text">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
