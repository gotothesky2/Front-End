import React from 'react';
import HeartToggle from './HeartToggle'; // 기존 컴포넌트 재활용
import   "../../styles/AddMajorModal.css"; // 스타일 따로 만들기

const AddMajorModal = ({ show, onClose, allMajors, myMajors, onToggle }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <span>계열 목록</span>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {allMajors.map((item, index) => (
            <div className="modal-item" key={index}>
              <HeartToggle
                selected={myMajors.includes(item)}
                onToggle={() => onToggle(item)}
              />
              {item}
              <span style={{ marginLeft: 'auto' }}>›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddMajorModal;
