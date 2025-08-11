// src/pages/GradeInput/StudentGrade.js
import React, { useState, useEffect } from 'react';
import '../../styles/StudentGrade.css';

import StudentGradeSidebar from '../../components/StudentGradeSidebar';
import StudentGradeModal   from '../../components/StudentGradeModal';
import StudentGradeHeader  from '../../components/StudentGradeHeader';
import StudentGradeTable   from '../../components/StudentGradeTable';
import StudentGradeTrend   from '../../components/StudentGradeTrend';

// API 모듈
import { registerReport, registerReportScores } from '../../api/report';

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

const STORAGE_KEY = 'hackathon_termData';

export default function StudentGrade() {
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [selectedTerm, setSelectedTerm]   = useState('');
  const [termData, setTermData]           = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [modalRows, setModalRows]         = useState([defaultRow()]);
  const [reportId, setReportId]           = useState(null); // 내신 보고서 ID
  const [loading, setLoading]             = useState(false);

  // termData가 바뀌면 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(termData));
  }, [termData]);

  // 페이지 최초 진입 시 reportId 생성/조회
  useEffect(() => {
    (async () => {
      try {
        if (!reportId) {
          const res = await registerReport(); // 보고서 생성 (백엔드 구조에 맞게 변경)
          setReportId(res.id); // Swagger 응답에 맞게 res.id 부분 확인
        }
      } catch (err) {
        console.error(err);
        alert('내신 보고서 생성에 실패했습니다.');
      }
    })();
  }, [reportId]);

  const handleOpenModal = term => {
    setSelectedTerm(term);
    setModalRows(termData[term] ? [...termData[term]] : [defaultRow()]);
    setIsModalOpen(true);
  };

  const handleSave = async (rows) => {
    if (!reportId) {
      alert('보고서 ID를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    try {
      setLoading(true);
      // 1) 백엔드에 저장
      await registerReportScores(reportId, selectedTerm, rows);

      // 2) 로컬 상태 반영
      setTermData(prev => ({ ...prev, [selectedTerm]: rows }));
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('저장에 실패했습니다: ' + (err.response?.data?.message || '알 수 없는 오류'));
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
        onSave={handleSave}
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








