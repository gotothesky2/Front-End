// src/components/Departmentselection/AddDepartmentModal.jsx
import React, { useEffect, useState } from "react";
import "../../styles/AddDepartmentModal.css";
import HeartToggle from "./HeartToggle";
import DepartmentUniversityModal from "./DepartmentUniversityModal"; // ✅ 대학 모달 import
import {
  fetchAllDepartments,
  toggleDepartmentBookmark
} from "../../api/departmentApi";

const AddDepartmentModal = ({
  show,
  onClose,
  onUpdateLikedDepartments,
  selected = [], // ✅ 선택된 학과명 리스트 (예: ["기계공학과", "컴퓨터공학과"])
}) => {
  const [departments, setDepartments] = useState([]);     // 전체 학과 목록 [{ id, name }]
  const [search, setSearch] = useState("");
  const [liked, setLiked] = useState([]);                 // ✅ 좋아요된 학과 id 리스트
  const [selectedDepartment, setSelectedDepartment] = useState(null); // ✅ 대학 모달용
  const [showUnivModal, setShowUnivModal] = useState(false);          // ✅ 대학 모달 표시 여부

  // 전체 학과 불러오기 + liked 초기화
  useEffect(() => {
    if (show) {
      fetchAllDepartments()
        .then((deptList) => {
          setDepartments(deptList);
          const selectedIds = deptList
            .filter((dept) => selected.includes(dept.name))
            .map((dept) => dept.id);
          setLiked(selectedIds);
        })
        .catch((err) => console.error("학과 전체 불러오기 실패:", err));
    }
  }, [show, selected]);

  // 검색 필터링
  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  // 하트 토글 클릭
  const handleToggle = async (id) => {
    try {
      const result = await toggleDepartmentBookmark(id);
      if (result) {
        setLiked((prev) =>
          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
        onUpdateLikedDepartments(); // 부모에 최신화 요청
      }
    } catch (error) {
      console.error("학과 토글 실패:", error);
    }
  };

  // 학과 이름 클릭 → 모달 열기
  const handleDepartmentClick = (dept) => {
    setSelectedDepartment(dept);
    setShowUnivModal(true);
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          {/* 헤더 */}
          <div className="modal-header">
            <span>학과 검색</span>
            <button onClick={onClose}>
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
              placeholder="학과명을 입력해주세요"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button>
              <img
                src={`${process.env.PUBLIC_URL}/icon/search_icon.svg`}
                alt="검색"
                className="search-icon"
              />
            </button>
          </div>

          {/* 학과 목록 */}
          <div className="modal-body">
            <div className="modal-subtitle">학과 목록</div>
            {filtered.map((item) => (
              <div
                key={item.id}
                className="modal-item"
                onClick={() => handleDepartmentClick(item)} // ✅ 학과명 클릭 시
              >
                <HeartToggle
                  selected={liked.includes(item.id)} // ✅ liked에 있는지 여부로 하트 표시
                  onToggle={(e) => {
                    e.stopPropagation();
                    handleToggle(item.id);
                  }}
                />
                <span className="department-name">{item.name}</span>
                <span className="arrow">›</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ 학과별 개설대학 모달 */}
      {showUnivModal && selectedDepartment && (
        <DepartmentUniversityModal
          show={showUnivModal}
          onClose={() => setShowUnivModal(false)}
          departmentId={selectedDepartment.id}
          departmentName={selectedDepartment.name}
        />
      )}
    </>
  );
};

export default AddDepartmentModal;
