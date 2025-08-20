// ReportFilter.js
import React, { useState } from 'react';
import '../../styles/Report.css'; // 필요 시

const ReportFilter = () => {
  const [grade, setGrade] = useState('3학년');
  const [semester, setSemester] = useState('1학기');
  const [reportDate, setReportDate] = useState('2025-06-17');

  return (
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

      <button className="report-btn" onClick={() => alert('조회 클릭됨')}>
        조회 🔍
      </button>
    </div>
  );
};

export default ReportFilter;
