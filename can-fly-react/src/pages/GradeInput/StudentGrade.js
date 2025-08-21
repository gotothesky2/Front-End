// src/pages/GradeInput/StudentGrade.js
import React, { useState, useEffect } from 'react';
import '../../styles/StudentGrade.css';

import StudentGradeSidebar from '../../components/StudentGradeSidebar';
import StudentGradeModal   from '../../components/StudentGradeModal';
import StudentGradeHeader  from '../../components/StudentGradeHeader';
import StudentGradeTable   from '../../components/StudentGradeTable';
import StudentGradeTrend   from '../../components/StudentGradeTrend';

// API
import { registerReportScores, fetchAllDetailReportAsTermData } from '../../api/report';

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

export default function StudentGrade() {
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [termData, setTermData]         = useState({});
  const [modalRows, setModalRows]       = useState([defaultRow()]);
  const [loading, setLoading]           = useState(false);

   // 서버에서 termData 동기화
 const refreshFromServer = async () => {
   try {
     setLoading(true);
     const serverTermData = await fetchAllDetailReportAsTermData();
     setTermData(serverTermData);
   } catch (e) {
     console.error('전체 내신 조회 실패:', e);
   } finally {
     setLoading(false);
   }
 };

 // 페이지 첫 진입 시 한 번 로드
 useEffect(() => {
   refreshFromServer();
   // eslint-disable-next-line react-hooks/exhaustive-deps
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
      await refreshFromServer();
      setIsModalOpen(false);
    } catch (err) {
        const status = err.response?.status;
        const data   = err.response?.data;
        const serverMsg = data?.message || data?.title || data?.detail || JSON.stringify(data);
        console.error('REGISTER_REPORT error >>>', {
          status,
          headers: err.response?.headers,
          data,
          requestPayload: err.config?.data,  // 실제 전송 바디
          url: err.config?.url,
          method: err.config?.method,
  });
  alert(`저장 실패 [${status ?? 'NO_STATUS'}]: ${serverMsg ?? err.message}`);
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
            <StudentGradeHeader userName="전성환" />

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









