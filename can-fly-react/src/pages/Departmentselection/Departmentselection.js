import React from 'react';
import  "../../styles/Departmentselection.css";


const Departmentselection = () => {
  return (
    <div className="panel-container">
      {/* 계열 */}
      <div className="panel">
        <div className="panel-title">계열 목록</div>
        <div className="panel-section">
          <p className="panel-subtitle">• 추천 계열</p>
          <div className="panel-item"><span>💙</span> xx 계열 <span>›</span></div>
          <div className="panel-item"><span>💙</span> 00 계열 <span>›</span></div>
        </div>
        <div className="panel-section">
          <p className="panel-subtitle">• 나의 계열목록</p>
          <div className="panel-item"><span>💙</span> 00 계열 <span>›</span></div>
          <div className="panel-item"><span>💙</span> 00 계열 <span>›</span></div>
          <div className="panel-add">+</div>
        </div>
      </div>

      {/* 학과 */}
      <div className="panel">
        <div className="panel-title">학과 목록</div>
        <div className="panel-section">
          <p className="panel-subtitle">• 추천 학과</p>
          <div className="panel-locked">
            🔒<br />
            <span>1-2 성적부터 입력 후 추천 가능</span>
          </div>
        </div>
        <div className="panel-section">
          <p className="panel-subtitle">• 나의 학과목록</p>
          <div className="panel-item"><span>💙</span> 00 학과 <span>›</span></div>
          <div className="panel-item"><span>💙</span> 00 학과 <span>›</span></div>
          <div className="panel-add">+</div>
        </div>
      </div>

      {/* 대학 */}
      <div className="panel">
        <div className="panel-title">대학 목록 <span className="panel-add-top">+</span></div>
        <div className="panel-locked full">
          🔒<br />
          <span>2-2 성적부터 입력 후 추천 가능</span>
        </div>
      </div>
    </div>
  );
};

export default Departmentselection;
