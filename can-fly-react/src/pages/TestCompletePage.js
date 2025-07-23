import React from 'react';
import '../styles/TestCompletePage.css';

const TestCompletePage = () => {
  return (
    <div className="test-complete-page">
      <div className="test-complete-container">

        <h1 className="complete-title">
          검사가 <span className="blue">완료</span>되었습니다.
        </h1>
        <p className="complete-desc">
          커리어넷에서 검사 결과를 PDF로 다운로드 하신 뒤 아래에 업로드 해주세요<br />
          분석을 통해 맞춤형 전공·진로를 추천해드립니다.
        </p>

        <div className="button-group">
          <button className="guide-button">입력 가이드</button>
          <button className="result-button">결과 보기</button>
        </div>

        <div className="upload-box">
          <img src="/img/upload.svg" alt="업로드 아이콘" className="upload-icon" />
          <p className="upload-text">검사 결과지 PDF를 업로드 해주세요.</p>
        </div>


        <button className="save-button">저장 하기</button>

      </div>
    </div>
  );
};

export default TestCompletePage;
