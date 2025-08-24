// src/pages/ReportOverview.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ReportOverview.css';
import { fetchAllAiReports } from '../api/aireport';

// 표준 학년/학기 키
const GRADES = [1, 2, 3];
const TERMS = [1, 2];

// 서버 아이템 → 화면용 정규화
function normalizeItem(raw) {
  // 날짜
  const dateStr =
    raw?.created_at ||
    raw?.createdAt ||
    raw?.date ||
    raw?.datetime ||
    raw?.created ||
    null;

  // 학년/학기 (aireport 응답 구조에 맞게 수정)
  let grade = raw?.reportGradeNum ?? raw?.grade ?? raw?.userGrade ?? raw?.gradeYear ?? raw?.schoolGrade ?? null;
  let term  = raw?.reportTermNum ?? raw?.term  ?? raw?.semester  ?? raw?.schoolTerm  ?? raw?.userTerm   ?? null;

  // 기본값 보정
  grade = Number(grade);
  if (!GRADES.includes(grade)) grade = 1;
  term = Number(term);
  if (!TERMS.includes(term)) term = 1;

  // 날짜 표기
  const dateText = dateStr
    ? new Date(dateStr).toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      })
    : '-';

  return {
    id: raw?.id ?? raw?._id ?? raw?.reportId ?? `${Math.random()}`,
    type: 'aireport', // aireport에서 오는 데이터는 모두 'aireport' 타입
    grade, term, dateText,
    // aireport 응답 구조에 맞게 수정
    testReport: raw?.testReport,
    scoreReport: raw?.scoreReport,
    totalReport: raw?.totalReport,
    // HmtID, CstID 추출 (Radar 차트용)
    HmtID: raw?.HmtID,
    CstID: raw?.CstID,
    // 원본 데이터 보존
    raw: raw
  };
}

const ReportOverview = () => {
  const navigate = useNavigate();
  
  // grade → term → items
  const [byGrade, setByGrade] = useState(() => {
    const init = {};
    GRADES.forEach(g => {
      init[g] = { grade: g, terms: { 1: [], 2: [] } };
    });
    return init;
  });
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const fetchReports = async () => {
    console.log("[RO] fetchReports called");
    setLoading(true);
    setErrMsg('');
    try {
      console.log("[RO] before fetchAllAiReports");
      const list = await fetchAllAiReports();
      console.log("[RO] after fetchAllAiReports:", list);
      console.log("[RO] list type:", typeof list);
      console.log("[RO] list length:", Array.isArray(list) ? list.length : 'not array');

      if (!Array.isArray(list)) {
        console.error("[RO] fetchAllAiReports returned non-array:", list);
        setErrMsg('데이터 형식이 올바르지 않습니다.');
        return;
      }

      const normalized = list.map(normalizeItem);
      console.log("[RO] normalized items:", normalized);

      const bucket = {};
      GRADES.forEach(g => {
        bucket[g] = { grade: g, terms: { 1: [], 2: [] } };
      });

      for (const it of normalized) {
        console.log("[RO] processing item:", it);
        const g = GRADES.includes(it.grade) ? it.grade : 1;
        const t = TERMS.includes(it.term) ? it.term : 1;
        console.log("[RO] mapped to grade:", g, "term:", t);
        
        bucket[g].terms[t].push({
          id: it.id,
          dateText: it.dateText,
          type: it.type, // 'aireport'
          testReport: it.testReport,
          scoreReport: it.scoreReport,
          totalReport: it.totalReport,
          HmtID: it.HmtID,
          CstID: it.CstID,
          raw: it.raw
        });
      }

      console.log("[RO] final bucket:", bucket);

      // 최신순 정렬
      GRADES.forEach(g => {
        TERMS.forEach(t => {
          bucket[g].terms[t].sort((a, b) => (a.dateText < b.dateText ? 1 : -1));
        });
      });

      setByGrade(bucket);
    } catch (e) {
      console.error("[RO] fetchReports error:", e?.response?.status, e?.response?.data || e.message);
      setErrMsg('결과를 불러오지 못했습니다.');
      const empty = {};
      GRADES.forEach(g => {
        empty[g] = { grade: g, terms: { 1: [], 2: [] } };
      });
      setByGrade(empty);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("[RO] mounted");
    fetchReports();
  }, []);

  const statusBox = useMemo(() => {
    if (loading) return <div style={{ padding: 12 }}>불러오는 중…</div>;
    if (errMsg)  return <div style={{ padding: 12, color: '#c00' }}>{errMsg}</div>;
    return null;
  }, [loading, errMsg]);

  // Report 페이지로 이동
  const goToReport = (report) => {
    console.log("[RO] goToReport called with report:", report);
    console.log("[RO] report.testReport:", report.testReport);
    console.log("[RO] report.scoreReport:", report.scoreReport);
    console.log("[RO] report.HmtID:", report.HmtID);
    console.log("[RO] report.CstID:", report.CstID);
    
    // Report 페이지로 이동하면서 리포트 데이터를 state로 전달
    navigate('/report', { 
      state: { 
        selectedReport: {
          id: report.id,
          type: report.type,
          dateText: report.dateText,
          // aireport 상세 데이터
          testReport: report.testReport,
          scoreReport: report.scoreReport,
          HmtID: report.HmtID,
          CstID: report.CstID,
          // 원본 데이터 보존
          raw: report.raw
        },
        fromOverview: true 
      } 
    });
  };

  return (
    <div className="test-results">
      <h2 className="main-title">레포트 모아보기</h2>
      {statusBox}

      {GRADES.map((g) => {
        const sem = byGrade[g]?.terms ?? { 1: [], 2: [] };
        return (
          <div key={g} className="semester-container">
            <h3 className="semester-title">{g}학년</h3>

            <div className="big-box">
              {/* 1학기 */}
              <div className="category-wrapper">
                <div className="category-title">• 1학기</div>
                <div className="category-box">
                  <div className="pdf-list">
                    {sem[1].length === 0 && (
                      <div className="pdf-item">
                        <span className="pdf-date">자료 없음</span>
                      </div>
                    )}
                    {sem[1].map((item) => (
                      <div
                        key={item.id}
                        className="pdf-item clickable"
                        onClick={() => goToReport(item)}
                        title="상세 리포트 보기"
                      >
                        <span className="pdf-date">
                          [AI 종합 분석] {item.dateText}
                        </span>
                        <img src="/icon/right_arrow.jpg" alt="arrow" className="arrow-icon rotated" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2학기 */}
              <div className="category-wrapper">
                <div className="category-title">• 2학기</div>
                <div className="category-box">
                  <div className="pdf-list">
                    {sem[2].length === 0 && (
                      <div className="pdf-item">
                        <span className="pdf-date">자료 없음</span>
                      </div>
                    )}
                    {sem[2].map((item) => (
                      <div
                        key={item.id}
                        className="pdf-item clickable"
                        onClick={() => goToReport(item)}
                        title="상세 리포트 보기"
                      >
                        <span className="pdf-date">
                          [AI 종합 분석] {item.dateText}
                        </span>
                        <img src="/icon/right_arrow.jpg" alt="arrow" className="arrow-icon rotated" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReportOverview;
