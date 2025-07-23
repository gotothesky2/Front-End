import React from 'react';
import '../styles/TestSelectPage.css';
import { useNavigate } from 'react-router-dom';

const AptitudeButton = () => {
  const navigate = useNavigate();

  return (
    <div className="card" onClick={() => navigate('/aptitudetest')}>
      <h3>직업 적성 검사</h3>
      <img src="/img/직업적성검사_버튼.png" alt="직업 적성 검사" className="card-icon" />
      <div className="card-link">하러가기 &gt;</div>
    </div>
  );
};

export default AptitudeButton;
