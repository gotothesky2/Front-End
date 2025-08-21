// src/pages/GradeInput/ExamGrade.js

import React, { useState, useEffect, useCallback } from 'react';
import MockExamSidebar from '../../components/MockExamSidebar';
import MockExamModal   from '../../components/MockExamModal';
import StudentGradeHeader from '../../components/StudentGradeHeader';
import MockExamTable from '../../components/MockExamTable';
import MockExamScoreTable from '../../components/MockExamScoreTable';
import MockExamTrend from '../../components/MockExamTrend';
import { fetchMe, fetchUserSummary } from '../../api/client'; // ✅ /auth/me → /users/info 폴백
import '../../styles/StudentGrade.css';

// ★ API 불러오기
import { getAllMockExams /*, postMockExam*/ } from '../../api/mockExam';

const STORAGE_KEY = 'hackathon_mockData';

// {kakao}홍길동 → 홍길동 (서버/클라 어디서 와도 방어)
const cleanProviderPrefix = (username = '') =>
  String(username).replace(/^\{[a-zA-Z0-9_]+\}/, '').trim();

export default function ExamGrade() {
  // 선택된 학기(term) + 모달 열림여부
  const [selectedTerm, setSelectedTerm] = useState('');
  const [isModalOpen,  setIsModalOpen]  = useState(false);

  // 로딩/에러 (조회 상태 표시용)
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  // 사용자명
  const [userName, setUserName] = useState('사용자');


  // ① lazy initializer 로 로컬스토리지에서 한 번만 불러옵니다.
  const [mockData, setMockData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });


// (중략) 기존 코드 유지

const normalizeApiResult = (list = []) => {
  const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const out = {};

  // 원본형: [{ examGrade, examMonth, scoreList:[{category, standardScore}...] }, ...]
  for (const item of list) {
    const { examGrade, examMonth, scoreList = [] } = item;
    const termKey = `${examGrade}학년 ${examMonth}월`;

    // category 매핑: 1=국어, 2=수학, 5=탐구1, 6=탐구2  (이 네 개만 사용)
    const byCat = (cat) => scoreList.find((s) => s.category === cat);

    out[termKey] = {
      koreanStd:   num(byCat(1)?.standardScore),
      mathStd:     num(byCat(2)?.standardScore),
      explore1Std: num(byCat(5)?.standardScore),
      explore2Std: num(byCat(6)?.standardScore),
      // 메타(필요시)
      examGrade,
      examMonth,
    };
  }

  return out;
};

// B) 재조회: API → 정규화 → 기존 mockData와 병합(서버값 우선)
const reload = React.useCallback(async () => {
  try {
    setLoading(true);
    setErr('');
    const list = await getAllMockExams(); // 반드시 res.data.result가 오도록 api 함수 맞춰두기
    const apiMapped = normalizeApiResult(list);

    setMockData((prev) => {
      const next = { ...prev, ...apiMapped };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  } catch (e) {
    console.error(e);
    setErr(e?.response?.data?.message || e.message || '모의고사 조회 실패');
  } finally {
    setLoading(false);
  }
}, []);


  // 초기 마운트 시 API 조회
  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  // 사용자 정보 불러오기: /auth/me → (없으면) /users/info
  useEffect(() => {
    const loadUser = async () => {
      try {
        // 1) /auth/me 시도
        const me = await fetchMe(); // { ok, data }
        let rawName =
          me?.data?.name ??
          me?.data?.username ??
          me?.data?.nickname ??
          me?.name ??
          me?.username ??
          me?.nickname ??
          '';

        // 2) name이 비었거나 /auth/me 실패 느낌이면 /users/info 폴백
        if (!rawName) {
          const info = await fetchUserSummary(); // { ok, name, ... }
          if (info?.ok && info?.name) rawName = info.name;
        }

        const cleaned = cleanProviderPrefix(rawName) || '사용자';
        setUserName(cleaned);
      } catch (e) {
        console.error('사용자 정보 조회 실패:', e);
        setUserName('사용자');
      }
    };
    loadUser();

  }, []);

  // 사이드바에서 term 클릭 시
  const handleOpenModal = (term) => {
    setSelectedTerm(term);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

 const handleSave = (rows) => {
   // rows 예시 대응: { koreanStd: '123', math: {standardScore: 130}, explore1: '50', ... }
   const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
   const pickStd = (v) => {
     if (v && typeof v === 'object') {
       return num(v.standardScore ?? v.std ?? v.value ?? v.val);
     }
     return num(v);
   };

  const stdObj = {
     koreanStd:   pickStd(rows.koreanStd ?? rows.korean),
     mathStd:     pickStd(rows.mathStd   ?? rows.math),
     explore1Std: pickStd(rows.explore1Std ?? rows.explore1 ?? rows.science1),
     explore2Std: pickStd(rows.explore2Std ?? rows.explore2 ?? rows.science2),
   };

   setMockData((prev) => {
     const prevTerm = prev[selectedTerm] || {};
     const nextTerm = { ...prevTerm, ...stdObj }; // 표준점수만 덮어쓰기
     const next = { ...prev, [selectedTerm]: nextTerm };
     localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
     return next;
   });
   setIsModalOpen(false);
 };

  // 모달에 넘길 초기 데이터 (없으면 빈 객체)
  const initialData = mockData[selectedTerm] || {};

  console.log('percentileData keys:', Object.keys(mockData || {}));
  console.log('term 3학년 6월:', mockData?.['3학년 6월']);

  return (
    <>
      {/* 흰색 배경 섹션 */}
      <div className="grade-page-container">
        <div className="grade-white-section">
          <div className="grade-path-text">
            <span className="grade-path-main">성적입력</span>
            <span className="grade-path-arrow">&nbsp;&gt;&nbsp;</span>
            <span className="grade-path-sub">모의고사 성적</span>
          </div>
          <div className="grade-title-box">
            <h2>모의고사 성적</h2>
          </div>
        </div>
      </div>

      {/* 회색 배경 섹션 */}
      <div className="grade-gray-section">
        <div
          className="grade-inner-container"
          style={{ display: 'flex', gap: '24px' }}
        >
          {/* 1) 사이드바 */}
          <div className="grade-sidebar-container">
            <MockExamSidebar onOpenModal={handleOpenModal} />
          </div>

          {/* 2) 메인 콘텐츠 (헤더 + 테이블) */}
          <div className="grade-main-content">
            {/* ✅ 서버에서 가져온 사용자명 표시 */}
            <StudentGradeHeader userName={userName} />

            {/* 조회 상태 표시 */}
            {loading && <div style={{ margin: '8px 0' }}>모의고사 데이터 불러오는 중…</div>}
            {err && <div style={{ color: 'crimson', margin: '8px 0' }}>{err}</div>}

            <div className="grade-table-header">
              <span className="grade-table-tab">모의고사 분석</span>
              <div className="grade-table-underline" />
            </div>

            {/* 백분위 테이블: 기존처럼 term->과목키 구조 사용 */}
            <MockExamTable percentileData={mockData} />

            {/* 표준점수 테이블: 위에서 *_Std 키도 같이 주입했음 */}
            <MockExamScoreTable rawData={mockData} />

            {/* 모의고사 추이(백분위) 차트 */}
            <MockExamTrend percentileData={mockData} />
          </div>
        </div>
      </div>

      {/* 모달 */}
      <MockExamModal
        isOpen={isModalOpen}
        term={selectedTerm}
        initialData={initialData}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </>
  );
}

