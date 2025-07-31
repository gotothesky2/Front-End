import React, { useState, useEffect } from 'react';
import '../../styles/StudentGrade.css';

import StudentGradeSidebar from '../../components/StudentGradeSidebar';
import StudentGradeModal   from '../../components/StudentGradeModal';
import StudentGradeHeader  from '../../components/StudentGradeHeader';
import StudentGradeTable   from '../../components/StudentGradeTable';
import StudentGradeTrend   from '../../components/StudentGradeTrend';

console.log({
  StudentGradeSidebar,
  StudentGradeModal,
  StudentGradeHeader,
  StudentGradeTable,
  StudentGradeTrend
});

// 기본 한 줄 초기값 생성 함수
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(termData));
  }, [termData]);

  const handleOpenModal = term => {
    setSelectedTerm(term);
    setModalRows(termData[term] ? [...termData[term]] : [defaultRow()]);
    setIsModalOpen(true);
  };

  const handleSave = rows => {
    setTermData(prev => ({ ...prev, [selectedTerm]: rows }));
    setIsModalOpen(false);
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
            {/* 인사 + 가이드 버튼 */}
            <StudentGradeHeader userName="전성환" />

            <div className="grade-table-header">
              <span className="grade-table-tab">주요교과 분석</span>
              <div className="grade-table-underline" />
            </div>
            

            {/* Figma 디자인대로 테이블 렌더링 */}
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
    </>
  );
}







