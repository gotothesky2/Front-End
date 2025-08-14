// src/pages/Report/Report.js
import React, { useState, useEffect } from "react";
import ReportFilter from "./ReportFilter";
import ReportSidebar from "./ReportSidebar";
import AptitudeRadar from "./AptitudeRadar";
import RiaSecCards from "./RiaSecCards";
import ReportScatter from "./ReportScatter";
import "../../styles/Report.css";
import AptitudeText from "./AptitudeText";
import ScoreTrend from "./ScoreTrend";
import ScoreTrendText from "./ScoreTrendText";
import InterestChart from "./InterestChart";
import ComprehensiveAnalysis from "./ComprehensiveAnalysis";

import { aiGet } from "../../api/aiApi";
import AIconfig from "../../api/AIconfig";

const Report = () => {
  // 관심 학과/학교 분석 데이터 관리 (더미 혹은 fetch)
  const [interestData, setInterestData] = useState([]);

  useEffect(() => {
    // TODO: 실제 API가 준비되면 아래 fetch를 사용하세요
    fetchDiscussions();

    // 백엔드 준비 전에는 더미 데이터 세팅
    setInterestData([
      { school: "한국항공대학교", dept: "소프트웨어학과", rate: 89 },
      { school: "한국항공대학교", dept: "컴퓨터공학과", rate: 85 },
      { school: "연세대학교", dept: "신학과", rate: 74 },
      { school: "연세대학교", dept: "의예과", rate: 1 },
    ]);
  }, []);

  const fetchDiscussions = async () => {
    try {
      const data = await aiGet(AIconfig.INTEREST.MY_HMT);
      console.log("정보 조회 성공:", data);
    } catch (error) {
      console.error("정보 조회 실패:", error);
      alert("정보 조회에 실패했습니다. 다시 시도해주세요.");
    }
  };

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
                fontWeight: "bold",
                fontSize: "50px",
                marginBottom: "10px",
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
                  fontWeight: "bold",
                  fontSize: "50px",
                  marginBottom: "10px",
                }}
              >
                성적 추이
              </div>
              <ScoreTrend />
              <ScoreTrendText />
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "50px",
                  marginBottom: "10px",
                }}
              >
                관심 학과/학교 분석
              </div>
              <InterestChart interestData={interestData} />
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "50px",
                  marginBottom: "10px",
                }}
              >
                종합 분석
              </div>
              <ComprehensiveAnalysis />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Report;
