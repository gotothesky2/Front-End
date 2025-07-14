import React from 'react';
import ReportFilter from './ReportFilter';
import ReportSidebar from './ReportSidebar';
import AptitudeAnalysis from './AptitudeAnalysis';
import '../../styles/Report.css';

const Report = () => {
  return (
    <>
      {/* 흰색 배경 영역 */}
      <div className='report-page-container'>
        <div className='report-white-section'>
          <div className='report-path-text'>
            <span className="report-path-main">마이페이지</span>
            <span className="report-path-arrow">&nbsp;&gt;&nbsp;</span>
            <span className="report-path-sub">레포트 모아보기</span>
          </div>

          <div className="report-title-box">
            <h2>분석 레포트</h2>
          </div>
        </div>
      </div>

      {/* 회색 배경은 report-page-container 바깥에 */}
      <div className="report-gray-section">
        <div className="report-inner-container">
          <ReportFilter />
        </div>

          <div className='report-inner-container report-content-layout'>
          <ReportSidebar />

          <div className='report-main-content'>
            <div id='aptitude'>
              <h2 className='section-title'>적성·미흥 검사 분석 결과</h2>
              <AptitudeAnalysis />
            </div>
            <div id='grades'>성적 추이</div>
            <div id='interest'>관심 학과/학교 분석</div>
            <div id='summary'>종합 분석</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Report;

