import React, { useState } from 'react';
import '../../styles/Report.css';

const Report = () => {
  const [grade, setGrade] = useState('3학년');
  const [semester, setSemester] = useState('1학기');
  const [reportDate, setReportDate] = useState('2025-06-17');

  return (
    <div className='report-page-container'>
      {/*경로 텍스트 영역 */}
      <div className='report-path-text'>
        <span className="report-path-main">마이페이지</span>
        <span className="report-path-arrow">&nbsp;&gt;&nbsp;</span>
        <span className="report-path-sub">레포트 모아보기</span>
      </div>
      {/* 제목 영역 */}
      <div className="report-title-box">
        <h2>분석 레포트</h2>
      </div>

      {/* 필터 박스 */}
      <div className="filter-box">
        <label>
          학년
          <select value={grade} onChange={(e) => setGrade(e.target.value)}>
            <option>1학년</option>
            <option>2학년</option>
            <option>3학년</option>
          </select>
        </label>

        <label>
          학기
          <select value={semester} onChange={(e) => setSemester(e.target.value)}>
            <option>1학기</option>
            <option>2학기</option>
          </select>
        </label>

        <label>
          레포트 생성 날짜
          <input
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
          />
        </label>

        <button className="search-btn" onClick={() => alert('조회 클릭됨')}>
          조회 🔍
        </button>
      </div>
    </div>
  );
};

export default Report;
