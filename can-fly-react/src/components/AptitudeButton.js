import React from 'react';
import '../styles/TestSelectPage.css';

const AptitudeButton = (props) => {
  return (
    <div className="card" onClick={props.onClick}>
      <div className="card-icon">📝</div>
      <h3>직업 적성 검사</h3>
      <div className="card-link">하러가기 &gt;</div>
    </div>
  );
};

export default AptitudeButton;
