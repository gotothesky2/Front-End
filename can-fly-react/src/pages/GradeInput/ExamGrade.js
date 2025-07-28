// src/pages/ExamGrade/ExamGrade.js
import React, { useState } from 'react';
import MockExamSidebar from '../../components/MockExamSidebar';
import MockExamModal   from '../../components/MockExamModal';
import StudentGradeHeader from '../../components/StudentGradeHeader';
import MockExamTable from '../../components/MockExamTable';
import MockExamScoreTable from '../../components/MockExamScoreTable';
import MockExamTrend from '../../components/MockExamTrend';
import '../../styles/StudentGrade.css';

const STORAGE_KEY = 'hackathon_mockData';

export default function ExamGrade() {
  // 선택된 학기(term) + 모달 열림여부
  const [selectedTerm, setSelectedTerm] = useState('');
  const [isModalOpen,  setIsModalOpen]  = useState(false);

  // ① lazy initializer 로 로컬스토리지에서 한 번만 불러옵니다.
  const [mockData, setMockData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // 사이드바에서 term 클릭 시
  const handleOpenModal = (term) => {
    setSelectedTerm(term);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // ② functional update + 즉시 localStorage 저장
  const handleSave = (rows) => {
    setMockData(prev => {
      const newData = { ...prev, [selectedTerm]: rows };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      return newData;
    });
    setIsModalOpen(false);
  };

  // 모달에 넘길 초기 데이터 (없으면 빈 객체)
  const initialData = mockData[selectedTerm] || {};

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
            <StudentGradeHeader userName="전성환" />

            <div className="grade-table-header">
              <span className="grade-table-tab">모의고사 분석</span>
              <div className="grade-table-underline" />
            </div>
            {/* 백분위 테이블 */}
            <MockExamTable percentileData={mockData} />

            {/* 표준점수 테이블 */}
            <MockExamScoreTable rawData={mockData} />

            {/* 추가: 모의고사 추이(백분위) 차트 */}
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


