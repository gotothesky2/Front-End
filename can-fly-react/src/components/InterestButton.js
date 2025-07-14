import React from 'react';
import '../styles/TestSelectPage.css';

const InterestButton = (props) => {
  return (
    <div className="card" onClick={props.onClick}>
      <div className="card-icon">📚</div>
      <h3>직업 흥미 검사</h3>
      <div className="card-link">하러가기 &gt;</div>
    </div>
  );
};

export default InterestButton;
