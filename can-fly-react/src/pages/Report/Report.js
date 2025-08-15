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
  const [interestData, setInterestData] = useState([]);
  const [hmtId, setHmtId] = useState(null); // ★ hmtId 상태 추가

  useEffect(() => {
    fetchMyHmt(); // 흥미검사 목록/정보 가져오기

    // 임시 더미 데이터
    setInterestData([
      { school: "한국항공대학교", dept: "소프트웨어학과", rate: 89 },
      { school: "한국항공대학교", dept: "컴퓨터공학과", rate: 85 },
      { school: "연세대학교", dept: "신학과", rate: 74 },
      { school: "연세대학교", dept: "의예과", rate: 1 },
    ]);
  }, []);

  const fetchMyHmt = async () => {
    try {
      const res = await aiGet(AIconfig.INTEREST.MY_HMT);
      console.log("정보 조회 성공:", res);

      // res.data가 배열인지 단건인지 확인 필요
      if (Array.isArray(res.data) && res.data.length > 0) {
        // 예: 최근 항목 id 사용
        setHmtId(res.data[0].id);
      } else if (res.data?.id) {
        setHmtId(res.data.id);
      }
    } catch (error) {
      console.error("정보 조회 실패:", error);
      alert("정보 조회에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <>
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

      <div className="report-gray-section">
        <div className="report-inner-container">
          <ReportFilter />
        </div>

        <div className="report-inner-container report-content-layout">
          <ReportSidebar active="aptitude" />
          <div className="report-contents">
            <div style={{ fontWeight: "bold", fontSize: "50px", marginBottom: "10px" }}>
              적성·흥미 검사 분석 결과
            </div>

            <div className="report-main-content">
              <section className="aptitude-section">
                <div className="aptitude-section__chart">
                  {/* hmtId가 있어야만 차트 렌더 */}
                  {hmtId ? <AptitudeRadar hmtId={hmtId} /> : <div>검사 데이터 없음</div>}
                </div>
                <div className="aptitude-section__cards">
                  <RiaSecCards />
                </div>
              </section>

              <ReportScatter />
              <AptitudeText />

              <div style={{ fontWeight: "bold", fontSize: "50px", marginBottom: "10px" }}>
                성적 추이
              </div>
              <ScoreTrend />
              <ScoreTrendText />

              <div style={{ fontWeight: "bold", fontSize: "50px", marginBottom: "10px" }}>
                관심 학과/학교 분석
              </div>
              <InterestChart interestData={interestData} />

              <div style={{ fontWeight: "bold", fontSize: "50px", marginBottom: "10px" }}>
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

