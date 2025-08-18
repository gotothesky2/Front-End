import React, { useState, useEffect, useRef } from "react";
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
import { Link } from "react-router-dom";

const Report = () => {
     // ▼ 각 섹션을 가리킬 ref
   const aptitudeRef = useRef(null);
   const gradesRef   = useRef(null);
   const interestRef = useRef(null);
   const summaryRef  = useRef(null);

   // 고정 헤더가 있다면 살짝 위로 여백을 두고 스크롤하려면 offset 사용
   const scrollToSection = (id) => {
     const map = {
       aptitude: aptitudeRef,
       grades:   gradesRef,
       interest: interestRef,
       summary:  summaryRef,
     };
     const el = map[id]?.current;
     if (!el) return;
      // 고정 헤더 + 여백만큼 보정(필요에 따라 100~160px 사이로 조정)
     const HEADER_OFFSET = 120;
     const top = el.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
     window.scrollTo({ top, behavior: "smooth" });
   };
  const [interestData, setInterestData] = useState([]);
  const [hmtId, setHmtId] = useState(null); // ★ hmtId 상태 추가
  const [cstId, setCstId] = useState(null); // ★ cstId 상태 추가

  useEffect(() => {
    fetchMyHmt(); // 흥미검사 목록/정보 가져오기
    fetchMyCst(); // 적성검사 목록/정보 가져오기

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
      console.error("흥미검사 조회 실패:", error);
    }
  };

  const fetchMyCst = async () => {
    try {
      const res = await aiGet(AIconfig.APTITUDE.MY_CST);
      console.log("정보 조회 성공:", res);

      // res.data가 배열인지 단건인지 확인 필요
      if (Array.isArray(res.data) && res.data.length > 0) {
        // 예: 최근 항목 id 사용
        setCstId(res.data[0].id);
      } else if (res.data?.id) {
        setCstId(res.data.id);
      }
    } catch (error) {
      console.error("적성검사 조회 실패:", error);
    }
  };

  return (
    <>
      <div className="report-page-container">
        <div className="report-white-section">
          <div className="report-path-text">
            <Link to="/Mypage" className="report-path-main report-path-link">마이페이지</Link>
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
          <ReportSidebar initialActive="aptitude" onJump={scrollToSection} />
          <div className="report-contents">
                 {/* 적성·흥미 검사 분석 결과 */}
          <div ref={aptitudeRef} style={{ scrollMarginTop: '140px' }}>
            <div style={{ fontWeight: "bold", fontSize: "50px", marginBottom: "10px" }}>
              적성·흥미 검사 분석 결과
            </div>
          </div>
          <div className="report-main-content">
           
              <section className="aptitude-section">
                <div className="aptitude-section__chart">
                  {/* hmtId가 있어야만 차트 렌더 */}
                  {hmtId ? <AptitudeRadar hmtId={hmtId} /> : <div>흥미검사 데이터 없음</div>}
                </div>
                <div className="aptitude-section__cards">
                  {hmtId ? <RiaSecCards hmtId={hmtId} /> : null}
                </div>
              </section>

              {cstId ? <ReportScatter cstId={cstId} /> : <div className="reportscatter-wrapper">적성검사 데이터 없음</div>}
              <AptitudeText />

                            {/* 성적 추이 */}
              <div ref={gradesRef} style={{ scrollMarginTop: '140px' }}>
                <div style={{ fontWeight: "bold", fontSize: "50px", marginBottom: "10px" }}>
                  성적 추이
                </div>
              </div>

              
              <ScoreTrend />
              <ScoreTrendText />

                            {/* 관심 학과·학교 분석 */}
              <div ref={interestRef} style={{ scrollMarginTop: '140px' }}>
                <div style={{ fontWeight: "bold", fontSize: "50px", marginBottom: "10px" }}>
                  관심 학과/학교 분석
                </div>
              </div>

              
              <InterestChart interestData={interestData} />

                            {/* 종합 분석 */}
              <div ref={summaryRef} style={{ scrollMarginTop: '140px' }}>
                <div style={{ fontWeight: "bold", fontSize: "50px", marginBottom: "10px" }}>
                  종합 분석
                </div>
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

