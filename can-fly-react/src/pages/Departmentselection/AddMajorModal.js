import React from 'react';
import HeartToggle from './HeartToggle';
import "../../styles/AddMajorModal.css"; // 새 스타일 파일

const AddMajorModal = ({ show, onClose, allMajors, myMajors, onToggle, onOpenMajorDepartments }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* 헤더 */}
        <div className="modal-header">
          <span>계열 목록</span>
          <button onClick={onClose} className="close-btn">
            <img
              src={`${process.env.PUBLIC_URL}/icon/exit_icon.svg`}
              alt="닫기"
              className="close-icon"
            /></button>
        </div>

        {/* 본문 */}
        <div className="modal-body">
          {allMajors.map((item, index) => (
            <div
              className="modal-item"
              key={index}
              onClick={() => onOpenMajorDepartments(item)}
            >
              <HeartToggle
                selected={myMajors.includes(item)}
                onToggle={(e) => {
                  e.stopPropagation();
                  onToggle(item);
                }}
              />
              {item}
              <span>›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddMajorModal;
