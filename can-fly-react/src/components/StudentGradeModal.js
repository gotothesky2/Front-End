import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/StudentGradeModal.css';
import StudentGradeModalRow from './StudentGradeModalRow';

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

const StudentGradeModal = ({
  term,
  isOpen,
  rows = [],
  setRows,
  onClose,
  onSave
}) => {
  const [isEditing, setIsEditing] = useState(true);

  const addRow = () => setRows(prev => [...prev, defaultRow()]);
  const deleteRows = () => setRows(prev => prev.filter(r => !r.checked));
  const updateRow = (id, field, value) =>
    setRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)));

  const handleSave = () => {
    setIsEditing(false);
    onSave(rows);
  };
  const handleModify = () => setIsEditing(true);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* 헤더 */}
        <div className="modal-header">
          <div>
            <span className="modal-term">{term}</span>
            <span className="modal-title">학생부 성적 입력</span>
          </div>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <hr />

        {/* 액션 버튼 (우측 끝 정렬) */}
        <div className="modal-actions">
          <button
            className="btn-modify"
            disabled={isEditing}
            onClick={handleModify}
          >
            수정
          </button>
          <button
            className="btn-delete"
            disabled={!isEditing}
            onClick={deleteRows}
          >
            삭제
          </button>
          <button
            className="btn-add"
            disabled={!isEditing}
            onClick={addRow}
          >
            +
          </button>
        </div>

        {/* 테이블 헤더 */}
        <div className="modal-table-header">
          <div className="cell checkbox"></div>
          <div className="cell number">번호</div>
          <div className="cell course-type">교과종류구분</div>
          <div className="cell subject-category">교과</div>
          <div className="cell subject">과목</div>
          <div className="cell">단위수</div>
          <div className="cell">석차등급</div>
          <div className="cell">원점수</div>
          <div className="cell">과목평균</div>
          <div className="cell">표준편차</div>
          <div className="cell">수강자수</div>
          <div className="cell">성취도</div>
        </div>

        {/* Rows */}
        {(rows || []).map((row, idx) => (
          <StudentGradeModalRow
            key={row.id}
            row={row}
            index={idx}
            isEditing={isEditing}
            onChange={updateRow}
          />
        ))}

        {/* 푸터: 가운데 정렬 */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            취소
          </button>
          <button
            className="btn-save"
            disabled={!isEditing}
            onClick={handleSave}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

StudentGradeModal.propTypes = {
  term: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  rows: PropTypes.array,
  setRows: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

StudentGradeModal.defaultProps = {
  rows: []
};

export default StudentGradeModal;



