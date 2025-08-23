// src/pages/ReportOverview.jsx
import React, { useEffect, useMemo, useState } from 'react';
import '../styles/ReportOverview.css';
import { fetchAllAiReports } from '../api/aireport';

// 표준 학년/학기 키
const GRADES = [1, 2, 3];
const TERMS = [1, 2];

// 서버 아이템 → 화면용 정규화
function normalizeItem(raw) {
  // 날짜
  const dateStr =
    raw?.createdAt ||
    raw?.created_at ||
    raw?.date ||
    raw?.datetime ||
    raw?.created ||
    null;

  // 타입(적성/흥미) 추론
  let type =
    raw?.type || raw?.category || raw?.kind || raw?.examType || raw?.reportType || '';

  if (!type) {
    const hint = `${raw?.title ?? ''} ${raw?.name ?? ''} ${raw?.slug ?? ''}`.toLowerCase();
    if (hint.includes('적성') || hint.includes('aptitude') || hint.includes('cst')) type = 'aptitude';
    else if (hint.includes('흥미') || hint.includes('interest') || hint.includes('hmt')) type = 'interest';
  }

  // 학년/학기
  let grade = raw?.grade ?? raw?.userGrade ?? raw?.gradeYear ?? raw?.schoolGrade ?? null;
  let term  = raw?.term  ?? raw?.semester  ?? raw?.schoolTerm  ?? raw?.userTerm   ?? null;

  // 기본값 보정
  grade = Number(grade);
  if (!GRADES.includes(grade)) grade = 1;
  term = Number(term);
  if (!TERMS.includes(term)) term = 1;

  // 링크
  const url =
    raw?.url || raw?.link || raw?.fileUrl || raw?.pdfUrl ||
    raw?.reportUrl || raw?.downloadUrl || null;

  // 날짜 표기
  const dateText = dateStr
    ? new Date(dateStr).toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      })
    : '-';

  return {
    id: raw?.id ?? raw?._id ?? raw?.reportId ?? `${Math.random()}`,
    type: type === 'interest' ? 'interest' : 'aptitude',
    grade, term, dateText, url,
  };
}

const ReportOverview = () => {
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
      console.log("[RO] after fetchAllAiReports:", Array.isArray(list) ? list.length : list);

      const normalized = list.map(normalizeItem);

      const bucket = {};
      GRADES.forEach(g => {
        bucket[g] = { grade: g, terms: { 1: [], 2: [] } };
      });

      for (const it of normalized) {
        const g = GRADES.includes(it.grade) ? it.grade : 1;
        const t = TERMS.includes(it.term) ? it.term : 1;
        bucket[g].terms[t].push({
          id: it.id,
          dateText: it.dateText,
          url: it.url,
          type: it.type, // 'aptitude' | 'interest'
        });
      }

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

  const openPdf = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
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
                        className="pdf-item"
                        role={item.url ? 'button' : undefined}
                        onClick={() => openPdf(item.url)}
                        title={item.url ? '열기' : undefined}
                      >
                        <span className="pdf-date">
                          [{item.type === 'interest' ? '흥미' : '적성'}] {item.dateText}
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
                        className="pdf-item"
                        role={item.url ? 'button' : undefined}
                        onClick={() => openPdf(item.url)}
                        title={item.url ? '열기' : undefined}
                      >
                        <span className="pdf-date">
                          [{item.type === 'interest' ? '흥미' : '적성'}] {item.dateText}
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
