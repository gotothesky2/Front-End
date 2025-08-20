// src/pages/GradeInput/StudentGrade.js
import React, { useEffect, useState } from 'react';
import '../../styles/StudentGrade.css';

import StudentGradeSidebar from '../../components/StudentGradeSidebar';
import StudentGradeModal   from '../../components/StudentGradeModal';
import StudentGradeHeader  from '../../components/StudentGradeHeader';
import StudentGradeTable   from '../../components/StudentGradeTable';
import StudentGradeTrend   from '../../components/StudentGradeTrend';

// API
import { registerReportScores } from '../../api/report';
import { fetchMe, fetchUserSummary } from '../../api/client'; // ✅ 사용자명 API

const defaultRow = () => ({
  id: Date.now(),
  checked: false,
  courseType: '일반선택',
  subjectCategory: '국어',
  subject: '국어',
  isCustom: false,
  credits: '',
  rank: '',
  score: '',
  average: '',
  deviation: '',
  students: '',
  achievement: ''
});

// {kakao}홍길동 → 홍길동
const cleanProviderPrefix = (username = '') =>
  String(username).replace(/^\{[a-zA-Z0-9_]+\}/, '').trim();

export default function StudentGrade() {
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [termData, setTermData]         = useState({});
  const [modalRows, setModalRows]       = useState([defaultRow()]);
  const [loading, setLoading]           = useState(false);

  // ✅ 사용자명 상태
  const [userName, setUserName] = useState('사용자');

  // 사용자명 로드: /auth/me → 실패/누락 시 /users/info
  useEffect(() => {
    const loadUserName = async () => {
      try {
        const me = await fetchMe(); // { ok, data }
        let rawName =
          me?.data?.name ??
          me?.data?.username ??
          me?.data?.nickname ??
          me?.name ??
          me?.username ??
          me?.nickname ??
          '';

        if (!rawName) {
          const info = await fetchUserSummary(); // { ok, name, ... }
          if (info?.ok && info?.name) rawName = info.name;
        }

        setUserName(cleanProviderPrefix(rawName) || '사용자');
      } catch (e) {
        console.error('사용자 정보 조회 실패:', e);
        setUserName('사용자');
      }
    };
    loadUserName();
  }, []);

  const handleOpenModal = (term) => {
    setSelectedTerm(term);
    setModalRows(termData[term] ? [...termData[term]] : [defaultRow()]);
    setIsModalOpen(true);
  };

  const handleSave = async (rows) => {
    try {
      setLoading(true);
      // 1) 백엔드 저장 (교과별로 여러 번 POST)
      await registerReportScores(selectedTerm, rows);

      // 2) 화면 상태 갱신
      setTermData(prev => ({ ...prev, [selectedTerm]: rows }));
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('저장에 실패했습니다: ' + (err?.response?.data?.message || '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <>
      {/* 상단 화이트 헤더 */}
      <div className="grade-page-container">
        <div className="grade-white-section">
          <div className="grade-path-text">
            <span className="grade-path-main">성적입력</span>
            <span className="grade-path-arrow">&nbsp;&gt;&nbsp;</span>
            <span className="grade-path-sub">학생부 성적</span>
          </div>
          <div className="grade-title-box">
            <h2>학생부 성적</h2>
          </div>
        </div>
      </div>

      {/* 그레이 배경 + 사이드바 + 메인 */}
      <div className="grade-gray-section">
        <div className="grade-inner-container">
          <div className="grade-sidebar-container">
            <StudentGradeSidebar onOpenModal={handleOpenModal} />
          </div>

          <div className="grade-main-content">
            {/* ✅ 사용자명 적용 */}
            <StudentGradeHeader userName={userName} />

            <div className="grade-table-header">
              <span className="grade-table-tab">주요교과 분석</span>
              <div className="grade-table-underline" />
            </div>

            <StudentGradeTable termData={termData} />
            <StudentGradeTrend termData={termData} />
          </div>
        </div>
      </div>

      <StudentGradeModal
        term={selectedTerm}
        isOpen={isModalOpen}
        rows={modalRows}
        setRows={setModalRows}
        onClose={handleCloseModal}
        onSave={handleSave}   // ← 저장 = 내신 등록
      />

      {loading && (
        <div className="loading-backdrop">
          <div className="loading-spinner" />
          <p>저장 중...</p>
        </div>
      )}
    </>
  );
}
