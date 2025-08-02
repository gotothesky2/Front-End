// components/AddDepartmentModal.jsx
import React from "react";
import HeartToggle from "./HeartToggle";
import "../../styles/AddDepartmentModal.css";

const AddDepartmentModal = ({ show, onClose, departments, selected, onToggle, search, onSearch }) => {
  if (!show) return null;

  const filtered = departments.filter((d) =>
    d.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <span>학과 검색</span>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="modal-search">
          <input
            type="text"
            placeholder="학과명을 입력해주세요"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
          <button className="search-btn">🔍</button>
        </div>

        <div className="modal-subtitle">학과 목록</div>
        <div className="modal-body">
          {filtered.map((item, index) => (
            <div className="modal-item" key={index}>
              <HeartToggle
                selected={selected.includes(item)}
                onToggle={() => onToggle(item)}
              />
              {item}
              <span style={{ marginLeft: "auto" }}>›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddDepartmentModal;
