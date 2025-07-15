import React from 'react';
import '../styles/TestSelectPage.css';

const AptitudeButton = (props) => {
  return (
    <div className="card" onClick={props.onClick}>
      <h3>직업 흥미 검사</h3>
      <img src="/img/직업흥미검사_버튼.png" alt="직업 적성 검사" className="card-icon" />
      <div className="card-link">하러가기 &gt;</div>
    </div>
  );
};

export default AptitudeButton;
