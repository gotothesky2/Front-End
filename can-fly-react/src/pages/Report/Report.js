import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import ReportFilter from "./ReportFilter";
import ReportSidebar from "./ReportSidebar";
import AptitudeRadar from "./AptitudeRadar";
import RiaSecCards from "./RiaSecCards";
import ReportScatter from "./ReportScatter";
import "../../styles/Report.css";
import AptitudeText from "./AptitudeText";
import ReportGradeTrendContainer from "../../components/ReportGradeTrendContainer";
import MockExamTrend from "../../components/MockExamTrend";
import ScoreTrendText from "./ScoreTrendText";
import InterestChart from "./InterestChart";
import ComprehensiveAnalysis from "./ComprehensiveAnalysis";

import { aiGet } from "../../api/aiApi";
import AIconfig from "../../api/AIconfig";
import { Link } from "react-router-dom";

const Report = () => {
  const location = useLocation();
  const selectedReport = location.state?.selectedReport;
  const fromOverview = location.state?.fromOverview || (selectedReport ? true : false); // selectedReport가 있으면 true로 설정

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
  const [currentReport, setCurrentReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  // ReportOverview에서 전달받은 레포트가 있으면 해당 레포트 로드
  useEffect(() => {
    console.log("[Report] useEffect triggered");
    console.log("[Report] selectedReport:", selectedReport);
    console.log("[Report] fromOverview:", fromOverview);
    
    if (selectedReport) {
      console.log("[Report] Loading selected report:", selectedReport);
      setCurrentReport(selectedReport);
      setReportData(selectedReport);
      
      // HmtID와 CstID 설정 (Radar 차트용)
      console.log("[Report] HmtID from selectedReport:", selectedReport.HmtID);
      console.log("[Report] CstID from selectedReport:", selectedReport.CstID);
      
      if (selectedReport.HmtID) {
        setHmtId(selectedReport.HmtID);
        console.log("[Report] Set HmtID:", selectedReport.HmtID);
      }
      if (selectedReport.CstID) {
        setCstId(selectedReport.CstID);
        console.log("[Report] Set CstID:", selectedReport.CstID);
      }
      
      // 데이터 구조 확인
      console.log("[Report] selectedReport.testReport:", selectedReport.testReport);
      console.log("[Report] selectedReport.scoreReport:", selectedReport.scoreReport);
      console.log("[Report] selectedReport.totalReport:", selectedReport.totalReport);
      console.log("[Report] selectedReport.raw:", selectedReport.raw);
      
      // raw 데이터에서 testReport, scoreReport, totalReport 추출 시도
      if (selectedReport.raw) {
        console.log("[Report] Attempting to extract from raw data");
        if (selectedReport.raw.testReport && !selectedReport.testReport) {
          console.log("[Report] Found testReport in raw data");
          setReportData(prev => ({
            ...prev,
            testReport: selectedReport.raw.testReport
          }));
        }
        if (selectedReport.raw.scoreReport && !selectedReport.scoreReport) {
          console.log("[Report] Found scoreReport in raw data");
          setReportData(prev => ({
            ...prev,
            scoreReport: selectedReport.raw.scoreReport
          }));
        }
        if (selectedReport.raw.totalReport && !selectedReport.totalReport) {
          console.log("[Report] Found totalReport in raw data");
          setReportData(prev => ({
            ...prev,
            totalReport: selectedReport.raw.totalReport
          }));
        }
      }
    } else {
      console.log("[Report] No selectedReport, using fallback logic");
      // 기존 로직: 최근 검사 결과 로드
      fetchMyHmt();
      fetchMyCst();
    }

    // 임시 더미 데이터
    setInterestData([
      { school: "한국항공대학교", dept: "소프트웨어학과", rate: 89 },
      { school: "한국항공대학교", dept: "컴퓨터공학과", rate: 85 },
      { school: "연세대학교", dept: "신학과", rate: 74 },
      { school: "연세대학교", dept: "의예과", rate: 1 },
    ]);
  }, [selectedReport, fromOverview]);

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
        setHmtId(res.data[0].id);
      } else if (res.data?.id) {
        setHmtId(res.data.id);
      }
    } catch (error) {
      console.error("적성검사 조회 실패:", error);
    }
  };

  // 현재 선택된 레포트 정보 표시
  const renderSelectedReportInfo = () => {
    if (!currentReport || !fromOverview) return null;

    return (
      <div className="selected-report-info" style={{
        background: '#f8f9fa',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#333' }}>
          📊 현재 보고 있는 레포트
        </h3>
        <div style={{ fontSize: '14px', color: '#666' }}>
          <strong>타입:</strong> {currentReport.type === 'interest' ? '흥미 검사' : '적성 검사'} | 
          <strong>날짜:</strong> {currentReport.dateText} | 
          <strong>ID:</strong> {currentReport.id}
        </div>
        {currentReport.content && (
          <div style={{ marginTop: '8px', fontSize: '13px', color: '#555' }}>
            <strong>요약:</strong> {currentReport.content.substring(0, 100)}...
          </div>
        )}
        {currentReport.score && (
          <div style={{ marginTop: '8px', fontSize: '13px', color: '#555' }}>
            <strong>총점:</strong> {currentReport.score}점
          </div>
        )}
      </div>
    );
  };

  // 레포트 데이터를 기반으로 적절한 컴포넌트 렌더링
  const renderReportContent = () => {
    console.log("[Report] renderReportContent called");
    console.log("[Report] reportData:", reportData);
    console.log("[Report] hmtId:", hmtId);
    console.log("[Report] cstId:", cstId);
    
    if (!reportData) {
      console.log("[Report] No reportData, rendering fallback content");
      return (
        <div className="report-main-content">
          <div ref={aptitudeRef} style={{ scrollMarginTop: '140px' }}>
            <div style={{ fontWeight: "bold", fontSize: "42px", marginBottom: "6px", marginTop: "16px", fontFamily: 'KakaoBold, sans-serif' }}>
              적성·흥미 검사 분석 결과
            </div>
          </div>
          
          <section className="aptitude-section">
            <div className="aptitude-section__chart">
              {hmtId ? <AptitudeRadar hmtId={hmtId} /> : <div>흥미검사 데이터 없음</div>}
            </div>
            <div className="aptitude-section__cards">
              {hmtId ? <RiaSecCards hmtId={hmtId} /> : null}
            </div>
          </section>

          {cstId ? <ReportScatter cstId={cstId} /> : <div className="reportscatter-wrapper">적성검사 데이터 없음</div>}
          <AptitudeText />
        </div>
      );
    }

    console.log("[Report] Rendering detailed content with reportData");
    console.log("[Report] testReport:", reportData.testReport);
    console.log("[Report] scoreReport:", reportData.scoreReport);
    
    // aireport에서 가져온 상세 데이터를 사용
    return (
      <div className="report-main-content">
        <div ref={aptitudeRef} style={{ scrollMarginTop: '140px' }}>
          <div style={{ fontWeight: "bold", fontSize: "42px", marginBottom: "6px", marginTop: "16px", fontFamily: 'KakaoBold, sans-serif' }}>
            적성·흥미 검사 분석 결과
          </div>
        </div>
        
        {/* 기존 컴포넌트들 먼저 표시 */}
        {hmtId && (
          <section className="aptitude-section">
            <div className="aptitude-section__chart">
              <AptitudeRadar hmtId={hmtId} />
            </div>
            <div className="aptitude-section__cards">
              <RiaSecCards hmtId={hmtId} />
            </div>
          </section>
        )}

        {cstId && <ReportScatter cstId={cstId} />}
        
        {/* AI 리포트가 없을 때만 디폴트 AptitudeText 표시 */}
        {!reportData?.testReport?.content && <AptitudeText />}

        {/* testReport 내용을 적성·흥미 검사 결과 밑에 표시 */}
        {reportData.testReport?.content && (
          <div className="report-test-content" style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            fontFamily: 'KakaoRegular, sans-serif'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333', fontFamily: 'KakaoBold, sans-serif' }}>📋 진학 추천 분석</h3>
            <div style={{ 
              lineHeight: '1.6', 
              color: '#555', 
              margin: '0',
              whiteSpace: 'pre-line', // 줄바꿈 유지
              fontFamily: 'KakaoRegular, sans-serif'
            }}>
              {reportData.testReport.content}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="report-page-container">
        <div className="report-white-section">
          <div className="report-path-text">
            <Link to="/Mypage" className="report-path-main report-path-link">마이페이지</Link>
            <span className="report-path-arrow">&nbsp;&gt;&nbsp;</span>
            <Link to="/reportoverview" className="report-path-main report-path-link">레포트 모아보기</Link>
            <span className="report-path-arrow">&nbsp;&gt;&nbsp;</span>
            <span className="report-path-sub">
              {currentReport ? 
                `${currentReport.type === 'interest' ? '흥미' : '적성'} 검사 결과` : 
                '레포트 모아보기'
              }
            </span>
          </div>

          {/* 선택된 레포트 정보 표시 */}
          {/* {renderSelectedReportInfo()} */}
          <div className="report-title-box">
            <h2>분석 레포트</h2>
          </div>
        </div>
      </div>

      <div className="report-gray-section">
        <div className="report-inner-container report-content-layout">
          <ReportSidebar initialActive="aptitude" onJump={scrollToSection} />
          <div className="report-contents">
            {/* ReportFilter를 여기로 이동 */}
            <ReportFilter 
              currentGrade={selectedReport?.raw?.reportGradeNum || reportData?.raw?.reportGradeNum}
              currentTerm={selectedReport?.raw?.reportTermNum || reportData?.raw?.reportTermNum}
              currentDate={selectedReport?.dateText || currentReport?.dateText}
              fromOverview={fromOverview}
            />
            
            {renderReportContent()}

            {/* 성적 추이 */}
            <div ref={gradesRef} style={{ scrollMarginTop: '140px' }}>
              <div style={{ fontWeight: "bold", fontSize: "42px", marginBottom: "10px", marginTop: "32px", fontFamily: 'KakaoBold, sans-serif' }}>
                성적 추이
              </div>
            </div>

            <ReportGradeTrendContainer />
            <MockExamTrend />
            
            {/* AI 리포트가 없을 때만 디폴트 ScoreTrendText 표시 */}
            {!reportData?.scoreReport?.content && <ScoreTrendText />}

            {/* scoreReport 내용을 성적 추이 밑에 표시 */}
            {reportData?.scoreReport?.content && (
              <div className="report-score-content" style={{
                background: 'white',
                padding: '24px',
                borderRadius: '12px',
                marginBottom: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                fontFamily: 'KakaoRegular, sans-serif'
              }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#333', fontFamily: 'KakaoBold, sans-serif' }}>📊 성적 분석 상세</h3>
                <div style={{ 
                  lineHeight: '1.6', 
                  color: '#555',
                  whiteSpace: 'pre-line', // 줄바꿈 유지
                  fontFamily: 'KakaoRegular, sans-serif'
                }}>
                  {reportData.scoreReport.content}
                </div>
              </div>
            )}

            {/* 관심 학과·학교 분석 */}
            <div ref={interestRef} style={{ scrollMarginTop: '140px' }}>
              <div style={{ fontWeight: "bold", fontSize: "42px", marginBottom: "10px", marginTop: "32px", fontFamily: 'KakaoBold, sans-serif' }}>
                관심 학과/학교 분석
              </div>
            </div>

            <InterestChart interestData={interestData} />

            {/* 종합 분석 */}
            <div ref={summaryRef} style={{ scrollMarginTop: '140px' }}>
              <div style={{ fontWeight: "bold", fontSize: "42px", marginBottom: "10px", marginTop: "32px", fontFamily: 'KakaoBold, sans-serif' }}>
                종합 분석
              </div>
            </div>

            {/* totalReport 내용을 종합 분석 부분에 표시 */}
            {reportData?.totalReport?.content ? (
              <div className="report-total-content" style={{
                background: 'white',
                padding: '24px',
                borderRadius: '12px',
                marginBottom: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                fontFamily: 'KakaoRegular, sans-serif'
              }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#333', fontFamily: 'KakaoBold, sans-serif' }}>🎯 AI 종합 분석</h3>
                <div style={{ 
                  lineHeight: '1.6', 
                  color: '#555',
                  whiteSpace: 'pre-line', // 줄바꿈 유지
                  fontFamily: 'KakaoRegular, sans-serif'
                }}>
                  {reportData.totalReport.content}
                </div>
              </div>
            ) : (
              // AI 리포트가 없을 때만 디폴트 ComprehensiveAnalysis 표시
              <ComprehensiveAnalysis />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Report;


