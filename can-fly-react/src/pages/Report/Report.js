// src/pages/Report/Report.js
import React from 'react';
import ReportFilter   from './ReportFilter';
import ReportSidebar  from './ReportSidebar';
import AptitudeRadar  from './AptitudeRadar';
import RiaSecCards    from './RiaSecCards';
import ReportScatter from './ReportScatter';
import '../../styles/Report.css';
import AptitudeText from './AptitudeText';
import ScoreTrend from './ScoreTrend';
import ScoreTrendText from './ScoreTrendText';

const Report = () => {
  return (
    <>
      {/* 흰색 배경 영역 */}
      <div className="report-page-container">
        <div className="report-white-section">
          <div className="report-path-text">
            <span className="report-path-main">마이페이지</span>
            <span className="report-path-arrow">&nbsp;&gt;&nbsp;</span>
            <span className="report-path-sub">레포트 모아보기</span>
          </div>
          <div className="report-title-box">
            <h2>분석 레포트</h2>
          </div>
        </div>
      </div>

      {/* 회색 배경 영역 */}
      <div className="report-gray-section">
        {/* 필터 전용 컨테이너 */}
        <div className="report-inner-container">
          <ReportFilter />
        </div>

        {/* 메인 콘텐츠 컨테이너 */}
        <div className="report-inner-container report-content-layout">
          <ReportSidebar active="aptitude" />

          <div className="report-contents">
            <div
              style={{
                fontWeight: 'bold',
                fontSize: '50px',
                marginBottom: '10px',
              }}
            >
              적성·흥미 검사 분석 결과
            </div>

            <div className="report-main-content">
              <section className="aptitude-section">
                <div className="aptitude-section__chart">
                  <AptitudeRadar />
                </div>
                <div className="aptitude-section__cards">
                  <RiaSecCards />
                </div>
              </section>
                <ReportScatter />
                <AptitudeText />
                  

              <div
              style={{
                fontWeight: 'bold',
                fontSize: '50px',
                marginBottom: '10px',
              }}
            >
              성적 추이
            </div>
              <ScoreTrend />
              <ScoreTrendText />
              <div id="interest">관심 학과/학교 분석</div>
              <div id="summary">종합 분석</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Report;


