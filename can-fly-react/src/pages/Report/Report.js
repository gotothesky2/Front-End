// src/pages/Report/Report.js
import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Cookies } from "react-cookie";

import ReportFilter from "./ReportFilter";
import ReportSidebar from "./ReportSidebar";
import AptitudeRadar from "./AptitudeRadar";
import RiaSecCards from "./RiaSecCards";
import ReportScatter from "./ReportScatter";
import AptitudeText from "./AptitudeText";
import ReportGradeTrendContainer from "../../components/ReportGradeTrendContainer";
import MockExamTrend from "../../components/MockExamTrend";
import ScoreTrendText from "./ScoreTrendText";
import InterestChart from "./InterestChart";
import ComprehensiveAnalysis from "./ComprehensiveAnalysis";

import "../../styles/Report.css";

// ✅ Ai Report 단건 조회 API
import { fetchAiReportById } from "../../api/realaireport";

const Report = () => {
  // URL: /report/:id
  const { id } = useParams();

  // 로그인 토큰
  const cookies = new Cookies();
  const token = cookies.get("accessToken");

  // 섹션 스크롤 refs
  const aptitudeRef = useRef(null);
  const gradesRef   = useRef(null);
  const interestRef = useRef(null);
  const summaryRef  = useRef(null);

  const scrollToSection = (sectionId) => {
    const map = {
      aptitude: aptitudeRef,
      grades:   gradesRef,
      interest: interestRef,
      summary:  summaryRef,
    };
    const el = map[sectionId]?.current;
    if (!el) return;
    const HEADER_OFFSET = 120;
    const top = el.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
  };

  // 서버 응답 상태
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  // 렌더링에 쓰이는 핵심 데이터
  const [report, setReport]             = useState(null);  // 전체 응답 객체
  const [hmtId, setHmtId]               = useState(null);  // 흥미검사 ID
  const [cstId, setCstId]               = useState(null);  // 적성검사 ID
  const [interestData, setInterestData] = useState([]);    // 관심 학과/학교 분석용

  // 🔁 상세 레포트 GET (토큰 없으면 호출 안 함)
  useEffect(() => {
    let abort = false;
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          // 비로그인 시 API 호출하지 않음
          return;
        }
        if (!id) throw new Error("유효하지 않은 리포트 ID");

        const res = await fetchAiReportById(id, { signal: controller.signal });

        // 응답 스키마 안전 처리: { success, data } or 바로 객체
        const payload = (res && typeof res === "object" && "data" in res) ? res.data : res;
        if (abort) return;

        if (!payload) throw new Error("레포트 데이터가 없습니다.");

        // 전체 report 저장
        setReport(payload);

        // 대문자 키 우선(HmtID/CstID)
        setHmtId(payload?.HmtID ?? payload?.hmtId ?? null);
        setCstId(payload?.CstID ?? payload?.cstId ?? null);

        // 관심 학과/학교 분석 데이터
        setInterestData(payload?.interestData ?? payload?.interest ?? []);
      } catch (e) {
        if (abort) return;
        console.error(e);
        const status = e?.response?.status;
        if (status === 401 || status === 403) {
          setError("권한이 없습니다. 다시 로그인 해주세요.");
        } else if (status === 404) {
          setError("해당 ID의 레포트를 찾을 수 없습니다.");
        } else {
          setError(e?.message || "레포트 조회 실패");
        }
      } finally {
        if (!abort) setLoading(false);
      }
    })();

    return () => {
      abort = true;
      controller.abort();
    };
  }, [id, token]);

  // ⬇️ 여기서부터는 훅 호출 이후의 조건부 렌더 (안전)
  if (!token) {
    return <div className="report-page-container">로그인이 필요합니다.</div>;
  }
  if (loading) return <div className="report-page-container">불러오는 중…</div>;
  if (error)   return <div className="report-page-container">오류: {error}</div>;
  if (!report) return <div className="report-page-container">데이터가 없습니다.</div>;

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
            <div ref={aptitudeRef} style={{ scrollMarginTop: "140px" }}>
              <div style={{ fontWeight: "bold", fontSize: "50px", marginBottom: "10px" }}>
                적성·흥미 검사 분석 결과
              </div>
            </div>

            <div className="report-main-content">
              <section className="aptitude-section">
                <div className="aptitude-section__chart">
                  {/* ✅ 상세 레포트에서 받은 HmtID로 렌더 */}
                 <AptitudeRadar hmtId={hmtId} />
                </div>
                <div className="aptitude-section__cards">
                  <RiaSecCards hmtId={hmtId} />
                </div>
              </section>

              {/* ✅ 상세 레포트에서 받은 CstID로 렌더 */}
              {cstId ? (
               <ReportScatter cstId={cstId} />
              ) : (
                <div className="reportscatter-wrapper">적성검사 데이터 없음</div>
              )}

              {/* 텍스트 분석 파트 */}
              <AptitudeText text={report?.testReport?.content ?? ""} />

              {/* 성적 추이 */}
              <div ref={gradesRef} style={{ scrollMarginTop: "140px" }}>
                <div style={{ fontWeight: "bold", fontSize: "50px", marginBottom: "10px" }}>
                  성적 추이
                </div>
              </div>

              {/* 필요시 report.gradeTrend 등으로 하위 컴포넌트에 연결 */}
              <ReportGradeTrendContainer trend={report?.gradeTrend ?? undefined} />
              <MockExamTrend data={report?.mockExamTrend ?? undefined} />
              <ScoreTrendText text={report?.scoreReport?.content ?? ""} />

              {/* 관심 학과/학교 분석 */}
              <div ref={interestRef} style={{ scrollMarginTop: "140px" }}>
                <div style={{ fontWeight: "bold", fontSize: "50px", marginBottom: "10px" }}>
                  관심 학과/학교 분석
                </div>
              </div>

              <InterestChart interestData={interestData} />

              {/* 종합 분석 */}
              <div ref={summaryRef} style={{ scrollMarginTop: "140px" }}>
                <div style={{ fontWeight: "bold", fontSize: "50px", marginBottom: "10px" }}>
                  종합 분석
                </div>
              </div>

              <ComprehensiveAnalysis text={report?.totalReport?.content ?? ""} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Report;




