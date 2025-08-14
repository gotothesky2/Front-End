import React, { useState } from "react";
import "../../styles/MajorDepartmentModal.css"; // 새 스타일 파일
import HeartToggle from "./HeartToggle";

const MajorDepartmentModal = ({
  show,
  onClose,
  title,
  departments,
  selected,
  onToggle
}) => {
  const [search, setSearch] = useState("");

  if (!show) return null;

  const filtered = departments.filter(d => d.includes(search));

  // 앞 3개는 추천 학과, 나머지는 일반 학과
  const recommendedDepartments = filtered.slice(0, 3);
  const otherDepartments = filtered.slice(3);

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        
        {/* 헤더 */}
        <div className="modal-header">
          <span>{title}</span>
          <button onClick={onClose} className="close-btn"><img
              src={`${process.env.PUBLIC_URL}/icon/exit_icon.svg`}
              alt="닫기"
              className="close-icon"
            /></button>
        </div>

        {/* 검색창 */}
        <div className="modal-search">
          <input
            placeholder="학과명을 입력해주세요"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="search-btn"><img 
          src={`${process.env.PUBLIC_URL}/icon/search_icon.svg`}
          className="search-icon"/></button>
        </div>

        {/* 스크롤 가능한 본문 */}
        <div className="modal-body">
          <div className="modal-subtitle">추천 학과</div>
          {recommendedDepartments.length === 0 ? (
            <div className="no-data">추천 학과가 없습니다.</div>
          ) : (
            recommendedDepartments.map((dept, idx) => (
              <div className="modal-item" key={idx}>
                <HeartToggle
                  selected={selected.includes(dept)}
                  onToggle={() => onToggle(dept)}
                />
                {dept}
                <span>›</span>
              </div>
            ))
          )}

          <div className="modal-subtitle">학과 목록</div>
          {otherDepartments.length === 0 ? (
            <div className="no-data">학과가 없습니다.</div>
          ) : (
            otherDepartments.map((dept, idx) => (
              <div className="modal-item" key={idx}>
                <HeartToggle
                  selected={selected.includes(dept)}
                  onToggle={() => onToggle(dept)}
                />
                {dept}
                <span>›</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MajorDepartmentModal;
