// src/components/MockExamSidebar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MockExamSidebar.css';  // CSS 파일명도 복제 후 변경

const MockExamSidebar = ({ onOpenModal }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* 1) 성적 유형 토글 */}
      <div className="sidebar-box">
        <h3>성적 유형</h3>
        <button onClick={() => navigate('/gradeinput')}>
          학생부
        </button>
        <button className="selected">
          수능/모의고사
        </button>
      </div>

      {/* 2) 모의고사 입력 버튼들 */}
      <div className="sidebar-box">
        <h3>성적 입력</h3>

        <p>1학년</p>
        <button onClick={() => onOpenModal('1학년 6월')}>
          1학년 6월 입력
        </button>
        <button onClick={() => onOpenModal('1학년 9월')}>
          1학년 9월 입력
        </button>

        <p>2학년</p>
        <button onClick={() => onOpenModal('2학년 6월')}>
          2학년 6월 입력
        </button>
        <button onClick={() => onOpenModal('2학년 9월')}>
          2학년 9월 입력
        </button>

        <p>3학년</p>
        <button onClick={() => onOpenModal('3학년 6월')}>
          3학년 6월 입력
        </button>
        <button onClick={() => onOpenModal('3학년 9월')}>
          3학년 9월 입력
        </button>

        <p>기타 입력</p>
        <button onClick={() => onOpenModal('3학년 6월')}>
          입력
        </button>
      </div>
    </>
  );
};

export default MockExamSidebar;
