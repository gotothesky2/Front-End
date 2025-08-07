import React, { useState } from "react";
import "../../styles/DepartmentUniversityModal.css";

const DepartmentUniversityModal = ({ show, onClose, departmentName }) => {
  const [search, setSearch] = useState("");

  if (!show) return null;

  // 예시 데이터
  const universityList = {
    "소프트웨어 학과": {
      상향: ["XX대-소프트웨어", "□□대-정보통신"],
      적정: ["XX대 소프트웨어", "□□대 소프트웨어"],
      하향: ["XX대-소프트웨어", "□□대-정보통신"]
    }
  };

  const data = universityList[departmentName] || { 상향: [], 적정: [], 하향: [] };

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="modal-header">
          <span>{departmentName}</span>
          <button onClick={onClose}><img
              src={`${process.env.PUBLIC_URL}/icon/exit_icon.svg`}
              alt="닫기"
              className="close-icon"
            /></button>
        </div>

        {/* 검색창 */}
        <div className="modal-search">
          <input
            placeholder="대학명을 입력해주세요"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="search-btn"><img 
          src={`${process.env.PUBLIC_URL}/icon/search_icon.svg`}
          className="search-icon"/></button>
        </div>

        {/* 본문 */}
        <div className="modal-body">
          <div className="modal-subtitle">추천 대학</div>

          {["상향", "적정", "하향"].map((category) => (
            <div key={category}>
              <div className="modal-subtitle-small">• {category}</div>
              {data[category].map((uni, idx) => (
                <div className="modal-item" key={idx}>
                  <img src={`${process.env.PUBLIC_URL}/icon/white_heart.svg`} alt="heart" />
                  {uni}
                  <span>›</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DepartmentUniversityModal;
