import React from 'react';

const StudentGradeHeader = ({ userName = '전성환' }) => {
  return (
    <div className="grade-header">
      <p className="grade-header__message">
        <span className="grade-header__username">{userName}</span>님 반갑습니다. 학생부 성적분석을 위해서는 학생부 성적입력이 필요합니다.
      </p>
      <button
        type="button"
        className="grade-header__guide-btn"
        onClick={() => console.log('가이드 클릭')}
      >
        학생부 성적 입력 가이드
      </button>
    </div>
  );
};

export default StudentGradeHeader;

