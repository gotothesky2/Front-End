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
  // /aireport/me 응답 스키마 기준
  const id = raw?.id ?? raw?._id ?? raw?.reportId ?? null;

  const grade = Number(raw?.reportGradeNum ?? raw?.grade ?? 1);
  const term  = Number(raw?.reportTermNum  ?? raw?.term  ?? 1);

  // 날짜
  const dateStr =
    raw?.created_at ||
    raw?.createdAt ||
    raw?.date ||
    raw?.datetime ||
    raw?.created ||
    null;

  const dateText = dateStr
    ? new Date(dateStr).toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      })
    : '-';

  return {
    id,
    grade: GRADES.includes(grade) ? grade : 1,
    term:  TERMS.includes(term) ? term : 1,
    dateText,
    // aireport 리스트는 단일 리포트이므로 타입 표기를 굳이 나누지 않음
    // (UI 라벨에 쓰려면 '적성' 고정 혹은 서버 확장 시에 맞춰 변경)
    type: 'aptitude',
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
    setLoading(true);
    setErrMsg('');
    try {
      const list = await fetchAllAiReports(); // 이미 /aireport/me 우선, fallback 내장
      const array = Array.isArray(list) ? list : [];
      const normalized = array.map(normalizeItem).filter(it => it.id);

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
          type: it.type, // 현재는 'aptitude' 고정
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
      console.error("[ReportOverview] fetchReports error:", e?.response?.status, e?.response?.data || e.message);
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
    fetchReports();
  }, []);

  const statusBox = useMemo(() => {
    if (loading) return <div style={{ padding: 12 }}>불러오는 중…</div>;
    if (errMsg)  return <div style={{ padding: 12, color: '#c00' }}>{errMsg}</div>;
    return null;
  }, [loading, errMsg]);

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
                        role="button"
                        onClick={() => navigate(`/report/${item.id}`)}
                        title="열기"
                      >
                        <span className="pdf-date">
                          {/* 타입 라벨: 필요 시 '흥미/적성'으로 변경 가능 */}
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
                        role="button"
                        onClick={() => navigate(`/report/${item.id}`)}
                        title="열기"
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

