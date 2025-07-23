import React, { useState, useEffect } from 'react';
import '../../styles/StudentGrade.css';
import StudentGradeSidebar from '../../components/StudentGradeSidebar';
import StudentGradeModal from '../../components/StudentGradeModal';

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

const StudentGrade = () => {
  // 1) 모달 열림/닫힘
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 2) 선택된 학기
  const [selectedTerm, setSelectedTerm] = useState('');
  // 3) term별 저장된 데이터: localStorage에서 한 번만 초기화
  const [termData, setTermData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  // 4) 모달에서 편집 중인 행들
  const [modalRows, setModalRows] = useState([defaultRow()]);

  // termData가 바뀔 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(termData));
  }, [termData]);

  // 사이드바 학기 클릭 → 팝업 열기
  const handleOpenModal = term => {
    setSelectedTerm(term);
    setModalRows(termData[term] ? [...termData[term]] : [defaultRow()]);
    setIsModalOpen(true);
  };

  // 팝업 저장 → termData 업데이트 + 모달 닫기
  const handleSave = rows => {
    setTermData(prev => ({
      ...prev,
      [selectedTerm]: rows
    }));
    setIsModalOpen(false);
  };

  // 팝업 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* 상단 흰색영역 */}
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

      {/* 회색 배경 + 사이드바 + 메인 */}
      <div className="grade-gray-section">
        <div className="grade-inner-container">
          <div className="grade-sidebar-container">
            <StudentGradeSidebar onOpenModal={handleOpenModal} />
          </div>
          <div className="grade-main-content">
            <h3>
              {selectedTerm
                ? `${selectedTerm}에 저장된 석차등급`
                : '학기를 선택해 주세요'}
            </h3>
            <ul>
              {(termData[selectedTerm] || []).map(r => (
                <li key={r.id}>
                  {r.subjectCategory} – {r.subject}: 석차등급{' '}
                  {r.rank || '미입력'}
                </li>
              ))}
            </ul>
            {/* 나중에 주요교과분석 테이블과 그래프를 넣으시면 됩니다 */}
          </div>
        </div>
      </div>

      {/* 모달 연동 */}
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
};

export default StudentGrade;





