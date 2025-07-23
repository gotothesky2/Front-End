import React from 'react';
import AptitudeButton from '../components/AptitudeButton';
import InterestButton from '../components/InterestButton';
import '../styles/TestSelectPage.css';

const TestSelectPage = () => {
  return (
    <div className="container">
      <div className="cards">
        <AptitudeButton onClick={() => alert('직업 적성 검사로 이동')} />
        <InterestButton onClick={() => alert('직업 흥미 검사로 이동')} />
      </div>
      <div className="back-button">
        돌아가기
      </div>
    </div>
  );
}

export default TestSelectPage;
