import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/StudentGradeSidebar.css';

const StudentGradeSidebar = ({ onOpenModal }) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="sidebar-box">
        <h3>성적 유형</h3>
        <button className="selected">학생부</button>
        <button onClick={() => navigate('/gradeinput/exam')}>수능/모의고사</button>
      </div>

      <div className="sidebar-box">
        <h3>성적 입력</h3>
        <p>1학년</p>
        <button onClick={() => onOpenModal('1학년 1학기')}>1학년 1학기 입력</button>
        <button onClick={() => onOpenModal('1학년 2학기')}>1학년 2학기 입력</button>
        <p>2학년</p>
        <button onClick={() => onOpenModal('2학년 1학기')}>2학년 1학기 입력</button>
        <button onClick={() => onOpenModal('2학년 2학기')}>2학년 2학기 입력</button>
        <p>3학년</p>
        <button onClick={() => onOpenModal('3학년 1학기')}>3학년 1학기 입력</button>
        <button onClick={() => onOpenModal('3학년 2학기')}>3학년 2학기 입력</button>
        <p>비교과</p>
        <button onClick={() => onOpenModal('3학년 1학기')}>입력</button>
        <p>학생부 성적 업로드</p>
        <button onClick={() => onOpenModal('3학년 1학기')}>입력</button>
      </div>
    </>
  );
};

export default StudentGradeSidebar;

