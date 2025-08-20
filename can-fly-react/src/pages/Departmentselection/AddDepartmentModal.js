import React from "react";
import "../../styles/AddDepartmentModal.css"; // 변경된 CSS 경로
import HeartToggle from "./HeartToggle";

const AddDepartmentModal = ({ show, onClose, departments, selected, onToggle, search, onSearch, onOpenUniversityPopup }) => {
  if (!show) return null;

  const filtered = departments.filter(d => d.includes(search));

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>학과 검색</span>
          <button onClick={onClose}><img
              src={`${process.env.PUBLIC_URL}/icon/exit_icon.svg`}
              alt="닫기"
              className="close-icon"
            /></button>
        </div>

        <div className="modal-search">
          <input
            type="text"
            placeholder="학과명을 입력해주세요"
            value={search}
            onChange={e => onSearch(e.target.value)}
          />
          <button><img 
          src={`${process.env.PUBLIC_URL}/icon/search_icon.svg`}
          className="search-icon"/></button>
        </div>

        <div className="modal-body">
          <div className="modal-subtitle">학과 목록</div>
          {filtered.map((item, idx) => (
            <div
              className="modal-item"
              key={idx}
              onClick={() => onOpenUniversityPopup(item)} // 🔹 학과 클릭 → 대학 팝업
            >
              <HeartToggle
                selected={selected.includes(item)}
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


export default AddDepartmentModal;
