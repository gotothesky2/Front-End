// src/components/Departmentselection/MajorDepartmentModal.jsx
import React, { useState, useEffect } from "react";
import "../../styles/MajorDepartmentModal.css";
import HeartToggle from "./HeartToggle";
import { fetchDepartmentsByField, toggleDepartmentBookmark } from "../../api/departmentApi";

const MajorDepartmentModal = ({
  show,
  onClose,
  title,
  fieldId,
  selected,
  onToggleGlobal,
}) => {
  const [search, setSearch] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState([]); // 로컬 좋아요 상태

  useEffect(() => {
    const loadDepartments = async () => {
      if (show && fieldId) {
        setLoading(true);
        try {
          const result = await fetchDepartmentsByField(fieldId); // [{ id, name }]
          setDepartments(result);
          setLiked(selected);
        } catch (error) {
          console.error("계열별 학과 조회 실패:", error);
          setDepartments([]);
        } finally {
          setLoading(false);
        }
      }
    };
    loadDepartments();
  }, [show, fieldId, selected]);

  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = async (dept) => {
    const { id, name } = dept;
    try {
      await toggleDepartmentBookmark(id); // ✅ 서버 반영

      const isLiked = liked.includes(name);
      const newLiked = isLiked
        ? liked.filter((item) => item !== name)
        : [...liked, name];
      setLiked(newLiked);

      if (onToggleGlobal) onToggleGlobal(name); // ✅ 상위 컴포넌트에 알림
    } catch (e) {
      console.error("학과 즐겨찾기 토글 실패:", e);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>{title}</span>
          <button onClick={onClose} className="close-btn">
            <img
              src={`${process.env.PUBLIC_URL}/icon/exit_icon.svg`}
              alt="닫기"
              className="close-icon"
            />
          </button>
        </div>

        <div className="modal-search">
          <input
            placeholder="학과명을 입력해주세요"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="search-btn">
            <img
              src={`${process.env.PUBLIC_URL}/icon/search_icon.svg`}
              className="search-icon"
              alt="검색"
            />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-subtitle">학과 목록</div>

          {loading ? (
            <div className="no-data">불러오는 중...</div>
          ) : filtered.length === 0 ? (
            <div className="no-data">학과가 없습니다.</div>
          ) : (
            filtered.map((dept) => (
              <div className="modal-item" key={dept.id}>
                <HeartToggle
                  selected={liked.includes(dept.name)}
                  onToggle={() => handleToggle(dept)}
                />
                {dept.name}
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
