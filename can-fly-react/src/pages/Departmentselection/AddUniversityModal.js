import React, { useState } from "react";
import "../../styles/AddUniversityModal.css";
import HeartToggle from "./HeartToggle";

const AddUniversityModal = ({ show, onClose, onToggle, selected }) => {
  const [search, setSearch] = useState("");

  if (!show) return null;

  // 예시 데이터
  const universityData = {
    상향: ["xx 대-소프트웨어", "□□ 대-기계"],
    적정: ["xx대 천체우주", "□□대 물리"],
    하향: ["xx 대-컴퓨터", "□□ 대-정보"]
  };

  const filterList = (list) => {
    if (!search.trim()) return list;
    return list.filter((item) => item.includes(search));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="modal-header">
          <span>대학-학과 검색</span>
          <button onClick={onClose} className="close-btn">
            <img
              src={`${process.env.PUBLIC_URL}/icon/exit_icon.svg`}
              alt="닫기"
              className="close-icon"
            />
          </button>
        </div>

        {/* 검색창 */}
        <div className="modal-search">
          <input
            type="text"
            placeholder="검색어를 입력해주세요"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="search-btn"><img 
          src={`${process.env.PUBLIC_URL}/icon/search_icon.svg`}
          className="search-icon"/></button>
        </div>

        {/* 본문 */}
        <div className="modal-body">
          <div className="modal-subtitle">추천 대학-학과</div>
          {["상향", "적정", "하향"].map((category) => {
            const filtered = filterList(universityData[category]);
            return (
              <div key={category}>
                <div className="modal-subtitle-small">• {category}</div>
                {filtered.length > 0 ? (
                  filtered.map((item, idx) => (
                    <div className="modal-item" key={idx}>
                      <HeartToggle
                        selected={selected?.[category]?.includes(item)}
                        onToggle={() => onToggle(category, item)}
                      />
                      {item}
                      <span>›</span>
                    </div>
                  ))
                ) : (
                  <div className="no-data">검색 결과가 없습니다</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AddUniversityModal;
