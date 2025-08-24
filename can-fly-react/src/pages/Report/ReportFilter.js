// ReportFilter.js
import React, { useState, useEffect } from 'react';
import '../../styles/Report.css'; // 필요 시

const ReportFilter = ({ currentGrade, currentTerm, currentDate, fromOverview }) => {
  const [grade, setGrade] = useState('3학년');
  const [semester, setSemester] = useState('1학기');
  const [reportDate, setReportDate] = useState('2025-06-17');

  // props로 전달받은 현재 레포트 정보로 초기값 설정
  useEffect(() => {
    if (fromOverview && currentGrade && currentTerm) {
      setGrade(`${currentGrade}학년`);
      setSemester(`${currentTerm}학기`);
    }
    if (currentDate) {
      // 날짜 형식 변환 (예: "2025. 08. 24. 오전 07:25:06" → "2025-08-24")
      const dateMatch = currentDate.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/);
      if (dateMatch) {
        const year = dateMatch[1];
        const month = dateMatch[2].padStart(2, '0');
        const day = dateMatch[3].padStart(2, '0');
        setReportDate(`${year}-${month}-${day}`);
      }
    }
  }, [currentGrade, currentTerm, currentDate, fromOverview]);

  return (
    <div className="filter-box" style={{ justifyContent: 'flex-start', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', fontFamily: 'KakaoBold, sans-serif' }}>학년</span>
        <div style={{
          padding: '8px 16px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
          fontSize: '16px',
          color: '#495057',
          minWidth: '80px',
          textAlign: 'center',
          fontFamily: 'KakaoRegular, sans-serif',
          fontWeight: '500'
        }}>
          {grade}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', fontFamily: 'KakaoBold, sans-serif' }}>학기</span>
        <div style={{
          padding: '8px 16px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
          fontSize: '16px',
          color: '#495057',
          minWidth: '80px',
          textAlign: 'center',
          fontFamily: 'KakaoRegular, sans-serif',
          fontWeight: '500'
        }}>
          {semester}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', fontFamily: 'KakaoBold, sans-serif' }}>생성일</span>
        <div style={{
          padding: '8px 16px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
          fontSize: '16px',
          color: '#495057',
          minWidth: '120px',
          textAlign: 'center',
          fontFamily: 'KakaoRegular, sans-serif',
          fontWeight: '500'
        }}>
          {reportDate}
        </div>
      </div>
    </div>
  );
};

export default ReportFilter;
